
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

    if (intersectsBlock(
      interval.start,
      interval.end,
      occupancy.blocks
    )) {
      throw new Error("BLOCKED");
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
  day, startTime, endTime, allDay, motivo
}) {
  const date = DateTime.fromISO(day, { zone: TZ });

  if (!date.isValid ||
      !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error("INVALID_TIME");
  }

  const validClock = value =>
    typeof value === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

  if (!allDay &&
      (!validClock(startTime) ||
       !validClock(endTime))) {
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

  if (!start.isValid ||
      !end.isValid ||
      end <= start) {
    throw new Error("INVALID_TIME");
  }

  if (typeof motivo !== "string" ||
      !motivo.trim() ||
      motivo.length > 200) {
    throw new Error("INVALID_REASON");
  }

  const db = await pool.connect();

  try {
    await db.query("BEGIN");

    await lockDay(db, day);

    // No bloquear encima de citas confirmadas.
    // Se respeta también el margen de 10 minutos.
    const occupied = await db.query(
      `SELECT id
       FROM public.citas
       WHERE estado = 'confirmada'
         AND inicio < $2
         AND fin + INTERVAL '10 minutes' > $1
       LIMIT 1`,
      [start.toJSDate(), end.toJSDate()]
    );

    if (occupied.rowCount) {
      throw new Error("HAS_APPOINTMENTS");
    }

    const overlapping = await db.query(
      `SELECT id FROM public.bloqueos
       WHERE inicio < $2 AND fin > $1
       LIMIT 1`,
      [start.toJSDate(), end.toJSDate()]
    );

    if (overlapping.rowCount) {
      throw new Error("BLOCKED");
    }

    const saved = await db.query(
      `INSERT INTO public.bloqueos
       (inicio, fin, motivo)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [start.toJSDate(), end.toJSDate(), motivo.trim()]
    );

    await db.query("COMMIT");

    return {
      id: saved.rows[0].id,
      day,
      allDay: Boolean(allDay)
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
