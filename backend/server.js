require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./database");
const { rateLimit } = require("express-rate-limit");
const {
  getAvailability,
  bookAppointment
} = require("./reservas");



const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const PORT = Number(process.env.PORT) || 4000;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN ||
    "https://psystem91.github.io",
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const adminRoutes = require("./adminRoutes");

app.use("/api/admin", adminRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Michell Spa API escuchando en ${PORT}`
  );
});

app.use(express.json({ limit: "10kb" }));

// Limitar consultas automatizadas
const queryLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

// Limitar intentos de reserva
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Michell Spa API"
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ database: "connected" });
  } catch (error) {
    console.error("Error de conexión:", error.message);
    res.status(503).json({
      database: "unavailable"
    });
  }
});

app.get(
  "/api/availability",
  queryLimiter,
  async (req, res) => {
    try {
      const { day, service } = req.query;

      if (typeof day !== "string" ||
          typeof service !== "string") {
        return res.status(400).json({
          error: "Fecha o tratamiento inválido"
        });
      }

      const slots = await getAvailability(
        day, service
      );

      res.json({ slots });

    } catch (error) {
      if (error.message === "INVALID_DATE" ||
          error.message === "INVALID_SERVICE") {
        return res.status(400).json({
          error: "Fecha o tratamiento inválido"
        });
      }

      console.error("Disponibilidad:", error.message);
      res.status(500).json({
        error: "Error consultando disponibilidad"
      });
    }
  }
);

app.post(
  "/api/book",
  bookingLimiter,
  async (req, res) => {
    const {
      name, phone, service,
      day, time, consent, website
    } = req.body || {};

    if (website) {
      return res.status(400).json({
        error: "Solicitud inválida"
      });
    }

    if (
      consent !== true ||
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.length > 80 ||
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
      const booking = await bookAppointment({
        name: name.trim(),
        phone: phone.trim(),
        service,
        day,
        time
      });

      return res.status(201).json({
        success: true,
        bookingId: booking.id,
        day: booking.day,
        time: booking.time
      });

    } catch (error) {
      if (["INVALID_SERVICE", "INVALID_TIME"]
          .includes(error.message)) {
        return res.status(400).json({
          error: "Tratamiento u horario inválido"
        });
      }

      if (["FULL", "BLOCKED"]
          .includes(error.message)) {
        return res.status(409).json({
          error: "El horario ya no está disponible"
        });
      }

      console.error("Reserva:", error.message);
      return res.status(500).json({
        error: "No se pudo guardar la cita"
      });
    }
  }
);