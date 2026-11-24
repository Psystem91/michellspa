
const pool = require("./database");
const { DateTime } = require("luxon");

const {
  validateStart,
  readOccupancy,
  capacityAvailable,
  intersectsBlock
} = require("./reservas");

const TZ = "America/Mexico_City";
const BUFFER = 10;

// Usa exactamente la misma llave que /api/book.
async function lockDay(client, day) {
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext($1))",
    [`michellspa:${day}`]
  );
}

function localDay(date) {
  return DateTime.fromJSDate(new Date(date))
    .setZone(TZ)
    .toISODate();
}

async function cancelAppointment(id) {
  const db = await pool.connect();

  try {
    await db.query("BEGIN");

    const result = await db.query(
      `UPDATE public.citas
       SET estado = 'cancelada'
       WHERE id = $1
         AND estado = 'confirmada'
       RETURNING id`,
      [id]
    );

    if (!result.rowCount) {
      throw new Error("NOT_FOUND");
    }

    await db.query("COMMIT");

    return { id, estado: "cancelada" };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
  }
}

async function rescheduleAppointment(id, day, time) {
  const db = await pool.connect();

  try {
    await db.query("BEGIN");

    // Primera lectura para identificar el día anterior.
    const previous = await db.query(
      `SELECT inicio
       FROM public.citas
       WHERE id = $1 AND estado = 'confirmada'`,
      [id]
    );

    if (!previous.rowCount) {
      throw new Error("NOT_FOUND");
    }

    const oldDay = localDay(previous.rows[0].inicio);

    // Bloquear ambas fechas en orden para reducir
    // el riesgo de interbloqueos.
    const days = [...new Set([oldDay, day])].sort();

    for (const d of days) {
      await lockDay(db, d);
    }

    // Volver a consultar bajo bloqueo.
    const current = await db.query(
      `SELECT id, inicio, servicio_id
       FROM public.citas
       WHERE id = $1 AND estado = 'confirmada'
       FOR UPDATE`,
      [id]
    );

    if (!current.rowCount) {
      throw new Error("NOT_FOUND");
    }

    const cita = current.rows[0];

    if (localDay(cita.inicio) !== oldDay) {
      throw new Error("CONFLICT");
    }

    const service = await db.query(
      `SELECT duracion_minutos
       FROM public.servicios
       WHERE id = $1 AND activo = TRUE`,
      [cita.servicio_id]
    );

    if (!service.rowCount) {
      throw new Error("INVALID_SERVICE");
    }

    const interval = validateStart(
      day,
      time,
      service.rows[0].duracion_minutos
    );

    if (!interval) {
      throw new Error("INVALID_TIME");
    }

    const occupancy = await readOccupancy(
      db,
      interval.start,
      interval.end
    );

    // Excluir la propia cita de la comprobación.
    const others = await db.query(
      `SELECT id, inicio, fin
       FROM public.citas
       WHERE estado = 'confirmada'
         AND id <> $3
         AND inicio < $2
         AND fin > $1`,
      [
        new Date(interval.start.toMillis() -
          BUFFER * 60000),
        new Date(interval.end.toMillis() +
          BUFFER * 60000),
        id
      ]
    );

    if (!capacityAvailable(
      interval.start,
      interval.end,
      others.rows,
      occupancy.blocks
    )) {
      throw new Error("FULL");
    }

    if (!capacityAvailable(
      interval.start,
      interval.end,
      others.rows
    )) {
      throw new Error("FULL");
    }

    await db.query(
      `UPDATE public.citas
       SET inicio = $2, fin = $3
       WHERE id = $1`,
      [
        id,
        interval.start.toJSDate(),
        interval.end.toJSDate()
      ]
    );

    await db.query("COMMIT");

    return { id, day, time, estado: "confirmada" };

  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
  }
}


async function blockSchedule({
  day,
  startTime,
  endTime,
  allDay,
  motivo,
  nombre_cliente = null,
  cupos_bloqueados = 2
}) {
  const date = DateTime.fromISO(day, { zone: TZ });

  if (
    typeof day !== "string" ||
    !date.isValid ||
    !/^\d{4}-\d{2}-\d{2}$/.test(day)
  ) {
    throw new Error("INVALID_TIME");
  }

  const validClock = value =>
    typeof value === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

  if (
    !allDay &&
    (!validClock(startTime) || !validClock(endTime))
  ) {
    throw new Error("INVALID_TIME");
  }

  const start = allDay
    ? date.startOf("day")
    : DateTime.fromISO(`${day}T${startTime}`, {
        zone: TZ
      });

  const end = allDay
    ? date.plus({ days: 1 }).startOf("day")
    : DateTime.fromISO(`${day}T${endTime}`, {
        zone: TZ
      });

  if (!start.isValid || !end.isValid || end <= start) {
    throw new Error("INVALID_TIME");
  }

  if (
    typeof motivo !== "string" ||
    !motivo.trim() ||
    motivo.length > 200
  ) {
    throw new Error("INVALID_REASON");
  }

  if (
    nombre_cliente !== null &&
    (
      typeof nombre_cliente !== "string" ||
      nombre_cliente.trim().length > 80
    )
  ) {
    throw new Error("INVALID_CLIENT");
  }

  if (
    !Number.isInteger(cupos_bloqueados) ||
    ![1,2].includes(cupos_bloqueados)
  ) {
    throw new Error("INVALID_CAPACITY");
  }

  const db = await pool.connect();

  try {
    await db.query("BEGIN");

    // Misma llave que las reservaciones normales
    await lockDay(db, day);

    const inicio = start.toJSDate();
    const fin = end.toJSDate();

    // Buscar citas que ocupen el intervalo.
    // Se conserva el margen de 10 minutos.
    const citas = await db.query(
      `SELECT inicio, fin
       FROM public.citas
       WHERE estado = 'confirmada'
         AND inicio < $2
         AND fin + INTERVAL '10 minutes' > $1`,
      [inicio, fin]
    );

    // Consultar bloqueos existentes
    const bloqueos = await db.query(
      `SELECT inicio, fin, cupos_bloqueados
       FROM public.bloqueos
       WHERE inicio < $2
         AND fin > $1`,
      [inicio, fin]
    );

    const inicioMs = start.toMillis();
    const finMs = end.toMillis();

    // Momentos en los que puede cambiar la ocupación
    const puntos = [inicioMs];

    for (const cita of citas.rows) {
      const t = new Date(cita.inicio).getTime();

      if (t > inicioMs && t < finMs) {
        puntos.push(t);
      }
    }

    for (const bloqueo of bloqueos.rows) {
      const t = new Date(bloqueo.inicio).getTime();

      if (t > inicioMs && t < finMs) {
        puntos.push(t);
      }
    }

    // Verificar que no se superen 2 espacios
    for (const t of puntos) {
      const citasOcupadas = citas.rows.filter(cita => {
        const a = new Date(cita.inicio).getTime();

        const b =
          new Date(cita.fin).getTime() +
          BUFFER * 60000;

        return a <= t && t < b;
      }).length;

      const espaciosBloqueados = bloqueos.rows.reduce(
        (total, bloqueo) => {
          const a = new Date(bloqueo.inicio).getTime();
          const b = new Date(bloqueo.fin).getTime();

          if (a <= t && t < b) {
            return total + bloqueo.cupos_bloqueados;
          }

          return total;
        },
        0
      );

      const total =
        citasOcupadas +
        espaciosBloqueados +
        cupos_bloqueados;

      if (total > 2) {
        throw new Error(
          citasOcupadas > 0
            ? "HAS_APPOINTMENTS"
            : "BLOCKED"
        );
      }
    }

    // Guardar nombre y cantidad de espacios
    const saved = await db.query(
      `INSERT INTO public.bloqueos
       (
         inicio,
         fin,
         motivo,
         nombre_cliente,
         cupos_bloqueados
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        inicio,
        fin,
        motivo.trim(),
        nombre_cliente?.trim() || null,
        cupos_bloqueados
      ]
    );

    await db.query("COMMIT");

    return {
      id: saved.rows[0].id,
      day,
      allDay: Boolean(allDay),
      nombre_cliente: nombre_cliente?.trim() || null,
      cupos_bloqueados
    };

  } catch (error) {
    await db.query("ROLLBACK");
    throw error;

  } finally {
    db.release();
  }
}


module.exports = {
  cancelAppointment,
  rescheduleAppointment,
  blockSchedule
};
