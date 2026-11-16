
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
      ) AS cita.inicio_local,
      to_char(
        fin AT TIME ZONE 'America/Mexico_City',
        'YYYY-MM-DD"T"HH24:MI:SS'
      ) AS cita.fin_local
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
        end: cita.fin_local
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

module.exports = router;
