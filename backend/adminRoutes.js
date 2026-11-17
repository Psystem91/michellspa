
const express = require("express");

const pool = require("./database");
const requireAdmin = require("./adminAuth");

const router = express.Router();

// Todas las rutas necesitan autenticación
// y autorización administrativa.
router.use(requireAdmin);

router.get("/citas", async (req, res) => {
  const { start, end } = req.query;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const {
      cancelAppointment,
      rescheduleAppointment,
      blockSchedule
    } = require("./adminOperations");

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

module.exports = router;
