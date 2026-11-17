const pool = require("./database");
const { DateTime } = require("luxon");

const TZ = "America/Mexico_City";
const CAPACITY = 2;
const BUFFER_MIN = 10;
const STEP_MIN = 10;
const ADVANCE_MIN = 30;

function validDay(day) {
  return typeof day === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    DateTime.fromISO(day, { zone: TZ }).isValid;
}

function windowsFor(day) {
  const date = DateTime.fromISO(day, { zone: TZ });

  if (!date.isValid || date.weekday === 7) return [];

  const schedules = date.weekday === 6
    ? [["12:00", "16:00"]]
    : [["11:00", "14:00"], ["16:00", "19:00"]];

  return schedules.map(([a, b]) => ({
    start: DateTime.fromISO(`${day}T${a}`, { zone: TZ }),
    end: DateTime.fromISO(`${day}T${b}`, { zone: TZ })
  }));
}

function validateStart(day, time, duration) {
  if (!validDay(day) ||
      typeof time !== "string" ||
      !/^\d{2}:\d{2}$/.test(time) ||
      !Number.isInteger(duration) ||
      duration <= 0) {
    return null;
  }

  const start = DateTime.fromISO(`${day}T${time}`, {
    zone: TZ
  });

  if (!start.isValid ||
      start.minute % STEP_MIN !== 0 ||
      start.hour > 23) return null;

  const end = start.plus({ minutes: duration });

  if (start < DateTime.now().setZone(TZ)
      .plus({ minutes: ADVANCE_MIN })) return null;

  const allowed = windowsFor(day).some(w =>
    start.toMillis() >= w.start.toMillis() &&
    end.toMillis() <= w.end.toMillis()
  );

  return allowed ? { start, end } : null;
}

const ms = value => new Date(value).getTime();

function capacityAvailable(start, end, appointments) {
  const from = start.toMillis();
  const to = end.plus({ minutes: BUFFER_MIN }).toMillis();
  const buffer = BUFFER_MIN * 60000;

  // La ocupación cambia solamente cuando comienza
  // o termina una reserva.
  const checkpoints = [from];

  for (const appointment of appointments) {
    const s = ms(appointment.inicio);
    if (s > from && s < to) checkpoints.push(s);
  }

  return checkpoints.every(t => {
    const occupied = appointments.filter(a => {
      const s = ms(a.inicio);
      const e = ms(a.fin) + buffer;
      return s <= t && t < e;
    }).length;

    return occupied < CAPACITY;
  });
}

function intersectsBlock(start, end, blocks) {
  const a = start.toMillis();
  const b = end.toMillis() + BUFFER_MIN * 60000;

  return blocks.some(block =>
    ms(block.inicio) < b && ms(block.fin) > a
  );
}

async function getService(client, service) {
  const result = await client.query(
    `SELECT id, nombre, duracion_minutos
     FROM public.servicios
     WHERE id = $1 AND activo = TRUE`,
    [service]
  );

  return result.rows[0] || null;
}

async function readOccupancy(client, start, end) {
  const bufferMs = BUFFER_MIN * 60000;
  const lower = new Date(start.toMillis() - bufferMs);
  const upper = new Date(
    end.toMillis() + bufferMs
  );

  const appointments = await client.query(
    `SELECT inicio, fin
     FROM public.citas
     WHERE estado = 'confirmada'
       AND inicio < $2
       AND fin > $1`,
    [lower, upper]
  );

  const blocks = await client.query(
    `SELECT inicio, fin
     FROM public.bloqueos
     WHERE inicio < $2 AND fin > $1`,
    [lower, upper]
  );

  return {
    appointments: appointments.rows,
    blocks: blocks.rows
  };
}

async function getAvailability(day, serviceId) {
  if (!validDay(day)) {
    throw new Error("INVALID_DATE");
  }

  const client = await pool.connect();

  try {
    const service = await getService(client, serviceId);
    if (!service) throw new Error("INVALID_SERVICE");

    const slots = [];
    const duration = service.duracion_minutos;

    const dayStart = DateTime.fromISO(day, {
      zone: TZ
    }).startOf("day");

    const occupancy = await readOccupancy(
      client,
      dayStart,
      dayStart.plus({ days: 1 })
    );

    for (const window of windowsFor(day)) {
      for (
        let start = window.start;
        start.plus({ minutes: duration }).toMillis() <=
          window.end.toMillis();
        start = start.plus({ minutes: STEP_MIN })
      ) {
        const interval = validateStart(
          day, start.toFormat("HH:mm"), duration
        );

        if (!interval) continue;

        if (intersectsBlock(
          interval.start, interval.end, occupancy.blocks
        )) continue;

        if (!capacityAvailable(
          interval.start, interval.end,
          occupancy.appointments
        )) continue;

        slots.push(start.toFormat("HH:mm"));
      }
    }

    return slots;
  } finally {
    client.release();
  }
}

async function bookAppointment({
  name, phone, service, day, time
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Todas las reservas de una fecha esperan
    // el mismo bloqueo de transacción PostgreSQL.
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      [`michellspa:${day}`]
    );

    const treatment = await getService(client, service);
    if (!treatment) throw new Error("INVALID_SERVICE");

    const interval = validateStart(
      day, time, treatment.duracion_minutos
    );

    if (!interval) throw new Error("INVALID_TIME");

    const { appointments, blocks } =
      await readOccupancy(
        client, interval.start, interval.end
      );

    if (intersectsBlock(
      interval.start, interval.end, blocks
    )) {
      throw new Error("BLOCKED");
    }

    if (!capacityAvailable(
      interval.start, interval.end, appointments
    )) {
      throw new Error("FULL");
    }

    const result = await client.query(
      `INSERT INTO public.citas
       (nombre_cliente, telefono, servicio_id,
        inicio, fin, estado, origen)
       VALUES ($1, $2, $3, $4, $5,
               'confirmada', 'web')
       RETURNING id`,
      [
        name,
        phone,
        service,
        interval.start.toJSDate(),
        interval.end.toJSDate()
      ]
    );

    await client.query("COMMIT");

    return {
      id: result.rows[0].id,
      day,
      time,
      service
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getAvailability,
  bookAppointment
  validateStart,
  readOccupancy,
  capacityAvailable,
  intersectsBlock
};