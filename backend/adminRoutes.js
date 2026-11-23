const express = require("express");
const pool = require("./database");
const requireAdmin = require("./adminAuth");
const {
  getAvailability,
  bookAppointment
} = require("./reservas");

const {
    cancelAppointment,
    rescheduleAppointment,
    blockSchedule
  } = require("./adminOperations");
const { message } = require("statuses");

const router = express.Router();

// Todas las rutas necesitan autenticación
// y autorización administrativa.
router.use(requireAdmin);

router.get("/citas", async (req, res) => {
  const { start, end } = req.query;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (
    typeof start !== "string" ||
    typeof end !== "string" ||
    !Number.isFinite(startDate.getTime()) ||
    !Number.isFinite(endDate.getTime()) ||
    startDate >= endDate ||
    endDate.getTime() - startDate.getTime() >
      1000 * 60 * 60 * 24 * 93
  ) {
    return res.status(400).json({
      error: "Rango de fechas inválido"
    });
  }

  try {
    const result = await pool.query(
      `SELECT
      id,
      nombre_cliente,
      telefono,
      numero_transaccion,
      servicio_id,
      to_char(
        inicio AT TIME ZONE 'America/Mexico_City',
        'YYYY-MM-DD"T"HH24:MI:SS'
      ) AS inicio_local,
      to_char(
        fin AT TIME ZONE 'America/Mexico_City',
        'YYYY-MM-DD"T"HH24:MI:SS'
      ) AS fin_local
    FROM public.citas
    WHERE estado = 'confirmada'
      AND inicio < $2
      AND fin > $1
    ORDER BY inicio`,
      [startDate, endDate]
    );

    const events = result.rows.map(cita => ({
      id: String(cita.id),
      title: `${cita.nombre_cliente} - ${cita.servicio_id}`,
      start: cita.inicio_local,
      end: cita.fin_local,
      extendedProps: {
        nombre: cita.nombre_cliente,
        telefono: cita.telefono,
        numero_transaccion: cita.numero_transaccion,
        servicio: cita.servicio_id
      }
    }));

    res.json(events);
  } catch (error) {
    console.error(
      "Error consultando citas administrativas:",
      error.message
    );

    res.status(500).json({
      error: "No se pudieron consultar las citas"
    });
  }
});


router.patch("/citas/:id", async (req, res) => {
  const { id } = req.params;
  const { estado, day, time } = req.body || {};
  
  console.log("Datos recibidos en PATCH:", {
    estado,
    day,
    time,
    tipos:{
      estado: typeof estado,
      day: typeof day,
      time: typeof time
    }
  });

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({
      error: "Identificador inválido"
    });
  }

  try {
    let result;

    if (estado === "cancelada") {
      result = await cancelAppointment(id);

    } else if (
      estado === "confirmada" &&
      typeof day === "string" &&
      typeof time === "string"
    ) {
      result = await rescheduleAppointment(
        id, day, time
      );

    } else {
      return res.status(400).json({
        error: "Operación inválida"
      });
    }

    return res.json({
      success: true,
      ...result
    });

  } catch (error) {
    const messages = {
      NOT_FOUND: [404, "La cita no existe o está cancelada"],
      INVALID_TIME: [400, "Fecha u horario inválido"],
      INVALID_SERVICE: [400, "Servicio no disponible"],
      FULL: [409, "No hay capacidad en ese horario"],
      BLOCKED: [409, "El horario está bloqueado"],
      CONFLICT: [409, "La cita cambió. Actualiza el calendario"]
    };

    if (messages[error.message]) {
      const [status, message] = messages[error.message];
      return res.status(status).json({ error: message });
    }

    console.error("Error modificando cita:", error.message);
    return res.status(500).json({
      error: "No fue posible modificar la cita"
    });
  }
});

router.post("/bloqueos", async (req, res) => {
  const {
    day,
    startTime,
    endTime,
    allDay,
    motivo
  } = req.body || {};

  try {
    const block = await blockSchedule({
      day,
      startTime,
      endTime,
      allDay: allDay === true,
      motivo
    });

    return res.status(201).json({
      success: true,
      ...block
    });

  } catch (error) {
    const messages = {
      INVALID_TIME: [400, "Fecha u horario inválido"],
      INVALID_REASON: [400, "Debes indicar un motivo válido"],
      HAS_APPOINTMENTS: [
        409,
        "Existen citas confirmadas en ese periodo"
      ],
      BLOCKED: [409, "El periodo ya está bloqueado"]
    };

    if (messages[error.message]) {
      const [status, message] = messages[error.message];
      return res.status(status).json({ error: message });
    }

    console.error("Error creando bloqueo:", error.message);

    return res.status(500).json({
      error: "No fue posible bloquear el horario"
    });
  }
});


/*
 * GET /api/admin/bloqueos
 * Consultar bloqueos para FullCalendar
 */
router.get("/bloqueos", async (req, res) => {
  const { start, end } = req.query;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (
    typeof start !== "string" ||
    typeof end !== "string" ||
    !Number.isFinite(startDate.getTime()) ||
    !Number.isFinite(endDate.getTime()) ||
    startDate >= endDate ||
    endDate.getTime() - startDate.getTime() >
      93 * 24 * 60 * 60 * 1000
  ) {
    return res.status(400).json({
      error: "Rango de fechas inválido"
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         id,
         motivo,
         to_char(
           inicio AT TIME ZONE 'America/Mexico_City',
           'YYYY-MM-DD"T"HH24:MI:SS'
         ) AS inicio_local,
         to_char(
           fin AT TIME ZONE 'America/Mexico_City',
           'YYYY-MM-DD"T"HH24:MI:SS'
         ) AS fin_local
       FROM public.bloqueos
       WHERE inicio < $2
         AND fin > $1
       ORDER BY inicio`,
      [startDate, endDate]
    );

    const bloqueos = result.rows.map(b => {
      const inicio = b.inicio_local;
      const fin = b.fin_local;

      const inicioDia = inicio.slice(11) === "00:00:00";
      const finDia = fin.slice(11) === "00:00:00";

      const unDiaCompleto =
        inicioDia && finDia &&
        (Date.parse(fin + "Z") -
         Date.parse(inicio + "Z") === 86400000);

      return {
        id: String(b.id),
        title: `Bloqueado: ${b.motivo}`,
        start: inicio,
        end: fin,
        allDay: unDiaCompleto,
        backgroundColor: "#AD4F62",
        borderColor: "#AD4F62",
        textColor: "#FFFFFF",
        extendedProps: {
          tipo: "bloqueo",
          motivo: b.motivo
        }
      };
    });

    res.json(bloqueos);

  } catch (error) {
    console.error(
      "Error consultando bloqueos:",
      error.message
    );

    res.status(500).json({
      error: "No se pudieron consultar los bloqueos"
    });
  }
});


/*
 * DELETE /api/admin/bloqueos/:id
 * Eliminar un bloqueo
 */
router.delete("/bloqueos/:id", async (req, res) => {
  const { id } = req.params;

  // Permitir identificadores UUID o numéricos.
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuid.test(id) && !/^\d+$/.test(id)) {
    return res.status(400).json({
      error: "Identificador de bloqueo inválido"
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM public.bloqueos
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "El bloqueo no existe"
      });
    }

    return res.json({
      success: true,
      id: String(result.rows[0].id),
      message: "Bloqueo eliminado correctamente"
    });

  } catch (error) {
    console.error(
      "Error eliminando bloqueo:",
      error.message
    );

    return res.status(500).json({
      error: "No se pudo eliminar el bloqueo"
    });
  }
});


/*
 * POST /api/admin/citas
 * Registrar una cita manual
 */
router.post("/citas", async (req, res) => {
  const {
    name,
    numero_transaccion,
    phone,
    service,
    day,
    time
  } = req.body || {};

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.length > 80 ||
    typeof numero_transaccion !== "string" ||
    !numero_transaccion.trim() ||
    numero_transaccion.length > 80 ||
    typeof phone !== "string" ||
    !/^[+\d\s()-]{7,22}$/.test(phone) ||
    typeof service !== "string" ||
    typeof day !== "string" ||
    typeof time !== "string"
  ) {
    return res.status(400).json({
      error: "Revisa los datos de la cita"
    });
  }

  try {
    // Utiliza la transacción que ya funciona.
    const booking = await bookAppointment({
      name: name.trim(),
      numero_transaccion: numero_transaccion.trim(),
      phone: phone.trim(),
      service,
      day,
      time,
      origen: "admin"
    });

    return res.status(201).json({
      success: true,
      bookingId: booking.id,
      day: booking.day,
      time: booking.time,
      numero_transaccion: numero_transaccion.trim() 
    });

  } catch (error) {
    const message = {
      INVALID_SERVICE: [400, "Servicio no disponible"],
      INVALID_TIME: [400, "Fecha u Horario invalido"],
      FULL: [409, "No hay capacidad en ese horario"],
      BLOCKED: [409, "El horario esta bloqueado"],
      INVALID_TRANSACTION: [400, "Numero de transaccion invalido"]
    };

    if(message[error.message]){
      const [status, message] = message[error.message];
      return res.status(status).json({error: message});
    }

    console.error(
      "Error al agendar manualmente:",
      error.message
    );

    return res.status(500).json({
      error: "No se pudo registrar la cita"
    });
  }
});


module.exports = router;
