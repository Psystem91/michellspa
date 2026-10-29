const { version } = require("os");
const path = require("path");
require("dotenv").config();
const express = require("express");
//const { google } = require("googleapis");
const { DateTime } = require("luxon");
//const path = require("path");
const {getGoogleCalendar} = require("./googleAuth");
const cors = require("cors");
const app = express();
app.disable("x-powered-by");
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "https://psystem91.github.io",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
const calendar = getGoogleCalendar();
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Michell Spa API"
  });
});
//app.use(express.json({limit:"10kb"}));
//app.use(express.static(path.join(__dirname, "michellspa")));
const TZ = "America/Mexico_City";
const CALENDAR_ID = process.env.CALENDAR_ID;
const PORT = process.env.PORT || 4000;
/*const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes:["https://www.googleapis.com/auth/calendar.events"]
});
const calendar = google.calendar({
    version:"v3", auth
});*/
const { authorize } = require("./googleAuth");
let calendar;
async function startServer() {
  try {
    const auth = await authorize();
    calendar = google.calendar({
      version: "v3",
      auth
    });
    app.listen(PORT, () => {
      console.log(
        `Agenda disponible en http://localhost:${PORT}/agenda.html`
      );
    });
  } catch (error) {
    console.error("Error de autenticación:", error.message);
    process.exit(1);
  }
}
startServer();
/*se agregaran las opciones las cuales se agendaran, despues
se colocaran con una variable*/
const SERVICES = {
    hollywood:{
        name:"hollywood peel laser",
        duration: 80
    },
    prueba:{
        name:"pueba",
        duration: 30
    }
};
const CAPACITY = 2;
const BUFFER = 10;
const STEP = 10;

function validDay(day){
    return /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    DateTime.fromISO(day,{zone: TZ}).isValid;
}

function windowsFor(day){
    const date = DateTime.fromISO(day, {zone: TZ});
    if (!date.isValid || date.weekday === 7) {
    return [];
  }
  // Sábados: 12:00 a 16:00
  // Lunes a viernes: 11:00 a 14:00 y 16:00 a 19:00
  const schedules = date.weekday === 6
    ? [["12:00", "16:00"]]
    : [
        ["11:00", "14:00"],
        ["16:00", "19:00"]
      ];
  return schedules.map(([start, end]) => ({
    start: DateTime.fromISO(`${day}T${start}`, {
      zone: TZ
    }),
    end: DateTime.fromISO(`${day}T${end}`, {
      zone: TZ
    })
  }));
}

async function getEvents(day){
    const start = DateTime.fromISO(day, {zone:TZ}).startOf("day");
    const end = start.plus({days: 1});
    const events = [];
    let pageToken;

    do{
        const response = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: start.toISO(),
            timeMax: end.toISO(),
            singleEvents: true,
            showDeleted: false,
            maxResults: 2500,
            pageToken
        });
        events.push(...(response.data.items || []));
        pageToken = response.data.nextPageToken;
    } while (pageToken);

    return events
    .filter(e => e.status !== "cancelled" &&
      e.transparency !== "transparent")
    .map(e => ({
      start: DateTime.fromISO(
        e.start.dateTime || e.start.date, { zone: TZ }
      ).toMillis(),
      end: DateTime.fromISO(
        e.end.dateTime || e.end.date, { zone: TZ }
      ).toMillis()
    }));
}

function available(start, duration, events) {
  const end = start.plus({ minutes: duration });
  if (start < DateTime.now().setZone(TZ).plus({ minutes: 30 })) {
    return false;
  }

  const permitted = windowsFor(start.toISODate()).some(w =>
    start >= w.start && end <= w.end
  );
  if (!permitted) return false;

  const newStart = start.toMillis();
  const newEnd = end.plus({ minutes: BUFFER }).toMillis();

  const boundaries = [
    { time: newStart, delta: 1 },
    { time: newEnd, delta: -1 }
  ];

  for (const e of events) {
    if (e.end + BUFFER * 60000 <= newStart ||
        e.start >= newEnd) continue;
    boundaries.push({
      time: e.start,
      delta: 1
    }, {
      time: e.end + BUFFER * 60000,
      delta: -1
    });
  }

  boundaries.sort((a, b) =>
    a.time - b.time || a.delta - b.delta
  );

  let occupancy = 0;
  for (const point of boundaries) {
    occupancy += point.delta;
    if (point.time >= newStart &&
        point.time < newEnd &&
        occupancy > CAPACITY) return false;
  }
  return true;
}

app.get("/api/availability", async (req, res) => {
  const { day, service } = req.query;
  if (!validDay(day) || !SERVICES[service]) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    const events = await getEvents(day);
    const slots = [];

    for (const window of windowsFor(day)) {
      for (let start = window.start;
        start.plus({ minutes: SERVICES[service].duration }).toMillis()<= window.end.toMillis();
        start = start.plus({ minutes: STEP })) {
        if (available(start, SERVICES[service].duration, events)) {
          slots.push(start.toFormat("HH:mm"));
        }
      }
    }
    res.json({ slots });
  } catch (error) {
    console.error("========== ERROR GOOGLE CALENDAR ==========");
    console.error("Mensaje:", error.message);
    console.error("Código HTTP:", error.response?.status);
    console.error("Detalle:", error.response?.data?.error?.message);
    console.error("===========================================");
    res.status(500).json({ error: "Error consultando calendario" });
  }
});

// Serializa las reservas en esta instancia del servidor.
let queue = Promise.resolve();

function serialized(action) {
  const result = queue.then(action);
  queue = result.catch(() => {});
  return result;
}

app.post("/api/book", async (req, res) => {
  const { name, phone, service, day, time, consent, website } = req.body;

  if (website) return res.status(400).json({ error: "Solicitud inválida" });
  if (!consent || typeof name !== "string" ||
      name.trim().length < 2 || name.length > 80 ||
      typeof phone !== "string" || !/^[+\d\s()-]{7,22}$/.test(phone) ||
      !validDay(day) || !SERVICES[service] ||
      !/^\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ error: "Revisa los datos" });
  }

  try {
    const result = await serialized(async () => {
      const start = DateTime.fromISO(`${day}T${time}`, { zone: TZ });
      const duration = SERVICES[service].duration;

      if (!start.isValid) return { error: "Horario inválido" };

      const events = await getEvents(day);
      if (!available(start, duration, events)) {
        return { error: "El horario ya no está disponible" };
      }

      const end = start.plus({ minutes: duration });
      const event = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: {
          summary: `${SERVICES[service].name} - ${name.trim()}`,
          description: `Cliente: ${name.trim()}\nTeléfono: ${phone}\nTratamiento: ${SERVICES[service].name}`,
          start: { dateTime: start.toISO(), timeZone: TZ },
          end: { dateTime: end.toISO(), timeZone: TZ },
          visibility: "private"
        }
      });

      return { success: true, eventId: event.data.id };
    });

    if (result.error) return res.status(409).json(result);
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "No se pudo guardar la cita" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Michell Spa API escuchando en ${PORT}`);
});