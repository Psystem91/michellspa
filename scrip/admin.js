const SUPABASE_URL =
  "https://wqwdcbsfvhohqjpbdcoa.supabase.co";

const SUPABASE_KEY = "sb_publishable_tJRZ4vIS6US2n9GTyiUeQQ_t3_M3O0A";

const API_URL =
  "https://michellspa-api.onrender.com";

console.log("URL Supabase:", SUPABASE_URL);
console.log("URL válida:", URL.canParse(SUPABASE_URL));  

const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

//const { title } = require("node:process");

const loginSection =
  document.getElementById("login-section");

const adminSection =
  document.getElementById("admin-section");

const loginForm =
  document.getElementById("login-form");

const loginButton =
  document.getElementById("login-button");

const logoutButton =
  document.getElementById("logout-button");

const message =
  document.getElementById("message");

let calendar = null;

function showMessage(text) {
  message.textContent = text;
}

function showLogin() {
  loginSection.classList.remove("hidden");
  adminSection.classList.add("hidden");
  logoutButton.classList.add("hidden");

  if (calendar) {
    calendar.destroy();
    calendar = null;
  }
}

function showAdmin(user) {
  loginSection.classList.add("hidden");
  adminSection.classList.remove("hidden");
  logoutButton.classList.remove("hidden");

  document.getElementById("admin-email")
    .textContent = user.email || "";

  if (!calendar) {
    createCalendar();
  } else {
    calendar.refetchEvents();
  }
}

async function fetchAdminCitas(info) {
  
  const { data, error } =
    await client.auth.getSession();

  if (error || !data.session) {
    throw new Error("Sesión no disponible");
  }

  const params = new URLSearchParams({
    start: info.startStr,
    end: info.endStr
  });

  const response = await fetch(
    `${API_URL}/api/admin/citas?${params}`,
    {
      headers: {
        Authorization:
          `Bearer ${data.session.access_token}`
      }
    }
  );

  if (response.status === 401 ||
      response.status === 403) {
    throw new Error(
      "No tienes autorización para consultar las citas"
    );
  }

  if (!response.ok) {
    throw new Error(
      `Error consultando citas: ${response.status}`
    );
  }

  return response.json();
}

// Consultar horarios bloqueados desde Render
async function fetchAdminBloqueos(info) {
  const params = new URLSearchParams({
    start: info.startStr,
    end: info.endStr
  });

  return await adminRequest(
    `/api/admin/bloqueos?${params}`,
    "GET"
  );
}

function createCalendar() {
  calendar = new FullCalendar.Calendar(
    document.getElementById("calendar"),
    {
      locale: "es",
      timeZone: "America/Mexico_City",

      initialView: "dayGridMonth",

      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right:
          "dayGridMonth,timeGridWeek,timeGridDay"
      },

      buttonText: {
        today: "Hoy",
        month: "Mes",
        week: "Semana",
        day: "Día"
      },

      firstDay: 1,
      nowIndicator: true,
      allDaySlot: false,
      slotMinTime: "10:00:00",
      slotMaxTime: "20:00:00",

      editable: false,
      selectable: false,

      events: async (info, success, failure) => {
        try {
          showMessage("");
          
          // consulta citas, bloqueos en paralelo
          const [citas, bloqueos] = await Promise.all([
            fetchAdminCitas(info),
            fetchAdminBloqueos(info)
          ]);
          //convertir las citas en eventos
          const eventosCitas = citas.map(cita => ({
            id: String(cita.id),
            title: cita.title,
            start: cita.start,
            end: cita.end,
            backgroundColor: "#447FA9",
            borderColor: "#447FA9",
            textColor: "#FFFFFF",
            display: "auto",

            extendedProps: {
              ...cita.extendedProps,
              tipo: "cita"
            }
          }));

          // los bloqueos ya llegan preparados desde el backend
          const eventosBloqueos = bloqueos.map(bloqueo => ({
            ...bloqueo,
            backgroundColor: "#AD4F62",
            borderColor: "#AD4F62",
            textColor: "#FFFFFF",
            display: "auto",
            extendedProps: {
              ...bloqueo.extendedProps,
              tipo: "bloqueo"
            }
          
          }));
          success([
            ...eventosCitas,
            ...eventosBloqueos
          ]);

          
        } catch (error) {
          console.error(
            "Error al cargar calendario:", error
          );
          showMessage(error.message);
          failure(error);
        }
      },

      eventClick(info) {
        const evento = info.event;
        if (evento.extendedProps.tipo === "bloqueo"){
          showBlockDetails(evento);
          return;
        }
        showAppointmentDetails(evento);
      }
    }
  );

  calendar.render();
}


async function showBlockDetails(evento) {
  const motivo =
    evento.extendedProps.motivo ||
    "Sin motivo registrado";

  const inicio = evento.startStr;
  const fin = evento.endStr;

  const descripcion = evento.allDay
    ? `Bloqueo de día completo\nDesde: ${inicio}\nHasta: ${fin} (exclusivo)`
    : `Desde: ${inicio}\nHasta: ${fin}`;

  const confirmed = confirm(
    "HORARIO BLOQUEADO\n\n" +
    `Motivo: ${motivo}\n` +
    `${descripcion}\n\n` +
    "¿Deseas eliminar este bloqueo y " +
    "liberar nuevamente el horario?"
  );

  if (!confirmed) return;

  try {
    await adminRequest(
      `/api/admin/bloqueos/${evento.id}`,
      "DELETE"
    );

    calendar.refetchEvents();

    showMessage(
      "Bloqueo eliminado correctamente"
    );

  } catch (error) {
    console.error(
      "Error eliminando bloqueo:",
      error
    );

    showMessage(error.message);
  }
}


loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  loginButton.disabled = true;
  showMessage("");

  try {
    const { error } =
      await client.auth.signInWithPassword({
        email,
        password
      });

    /*if (error) {
      throw new Error("Correo o contraseña incorrectos");
    }*/
    if (error) {
        console.error("Supabase Auth:", {
            status: error.status,
            code: error.code,
            message: error.message
        });

    throw new Error(
            error.message === "Invalid login credentials"
            ? "Correo o contraseña incorrectos"
            : "Error de autenticación: " + error.message
        );
    }

    const { data } = await client.auth.getUser();

    if (!data.user) {
      throw new Error("No se pudo verificar la sesión");
    }

    showAdmin(data.user);
    document.getElementById("password").value = "";

  } catch (error) {
    showMessage(error.message);
  } finally {
    loginButton.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  await client.auth.signOut();
  showLogin();
  showMessage("Sesión cerrada");
});


// ==================================
// AGENDAR CITA MANUAL
// ==================================

const manualDialog =
  document.getElementById("manual-appointment-dialog");

const manualForm =
  document.getElementById("manual-appointment-form");

const manualDay =
  document.getElementById("manual-day");

const manualTime =
  document.getElementById("manual-time");

const manualService =
  document.getElementById("manual-service");

const manualStatus =
  document.getElementById("manual-status");

const manualSave =
  document.getElementById("manual-save");

// Abrir formulario
document.getElementById("new-appointment")
  .addEventListener("click", () => {
    // Limpiar los campos individualmente
    document.getElementById("manual-name").value = "";
    document.getElementById("manual-phone").value = "";
    document.getElementById("manual-day").value = "";

    manualService.value = "hollywood";

    manualTime.innerHTML =
      '<option value="">Selecciona una fecha</option>';
    manualTime.disabled = true;
    manualStatus.textContent = "";
    manualDialog.showModal();
  });

// Cerrar formulario
document.getElementById("manual-close")
  .addEventListener("click", () => {
    manualDialog.close();
  });

// Consultar horarios disponibles
async function loadManualSlots() {
  const day = manualDay.value;
  const service = manualService.value;

  manualTime.innerHTML =
    '<option value="">Consultando horarios...</option>';

  manualTime.disabled = true;
  manualStatus.textContent = "";

  if (!day || !service) {
    manualTime.innerHTML =
      '<option value="">Selecciona una fecha</option>';
    return;
  }

  const requestedDay = day;
  const requestedService = service;

  try {
    const params = new URLSearchParams({
      day,
      service
    });

    const response = await fetch(
      `${API_URL}/api/availability?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Error consultando horarios"
      );
    }

    // Evitar resultados de una consulta anterior.
    if (
      manualDay.value !== requestedDay ||
      manualService.value !== requestedService
    ) return;

    manualTime.innerHTML =
      '<option value="">Selecciona un horario</option>';

    if (!Array.isArray(data.slots)) {
      throw new Error("Respuesta de horarios inválida");
    }

    for (const slot of data.slots) {
      const option = document.createElement("option");
      option.value = slot;
      option.textContent = slot;
      manualTime.appendChild(option);
    }

    if (data.slots.length === 0) {
      manualStatus.textContent =
        "No hay horarios disponibles para esta fecha.";
    }

    manualTime.disabled = data.slots.length === 0;

  } catch (error) {
    if (
      manualDay.value !== requestedDay ||
      manualService.value !== requestedService
    ) return;

    manualStatus.textContent = error.message;

    manualTime.innerHTML =
      '<option value="">Sin horarios disponibles</option>';
  }
}

// Actualizar horarios al cambiar fecha o servicio
manualDay.addEventListener("change", loadManualSlots);
manualService.addEventListener("change", loadManualSlots);

// Guardar reservación
manualForm.addEventListener("submit", async event => {
  event.preventDefault();

  const payload = {
    name: document.getElementById("manual-name")
      .value.trim(),

    phone: document.getElementById("manual-phone")
      .value.trim(),

    service: manualService.value,
    day: manualDay.value,
    time: manualTime.value
  };

  if (
    !payload.name ||
    !payload.phone ||
    !payload.day ||
    !payload.time
  ) {
    manualStatus.textContent =
      "Completa todos los datos de la cita.";
    return;
  }

  if (!confirm(
    `¿Registrar la cita de ${payload.name} ` +
    `el ${payload.day} a las ${payload.time}?`
  )) return;

  manualSave.disabled = true;
  manualStatus.textContent = "Guardando cita...";

  try {
    const result = await adminRequest(
      "/api/admin/citas",
      "POST",
      payload
    );

    manualDialog.close();

    calendar.gotoDate(payload.day);
    calendar.refetchEvents();

    showMessage(
      `Cita registrada correctamente. ` +
      `Folio: ${result.bookingId}`
    );

  } catch (error) {
    manualStatus.textContent = error.message;

    // Volver a consultar horarios, porque
    // otra persona pudo ocupar el espacio.
    await loadManualSlots();

  } finally {
    manualSave.disabled = false;
  }
});


async function initialize() {
  showLogin();

  try {
    const { data: sessionData } =
      await client.auth.getSession();

    if (!sessionData.session) return;

    const { data, error } =
      await client.auth.getUser();

    if (error || !data.user) {
      showLogin();
      return;
    }

    showAdmin(data.user);
  } catch (error) {
    showMessage("No se pudo recuperar la sesión");
    showLogin();
  }
}

client.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    showLogin();
  }
});

const appointmentDialog =
  document.getElementById("appointment-dialog");

const blockDialog =
  document.getElementById("block-dialog");

let selectedAppointmentId = null;

async function adminRequest(path, method, body) {

  // VALIDAR RUTA Y MÉTODO
  if (
    typeof path !== "string" ||
    !path.startsWith("/api/admin/") ||
    !["GET", "POST", "PATCH", "DELETE"].includes(method)
  ) {
    throw new Error(
      "Ruta o método administrativo inválido"
    );
  }

  // VALIDAR SESIÓN
  const { data, error } =
    await client.auth.getSession();

  if (error || !data.session) {
    throw new Error("Debes iniciar sesión");
  }

  // CONSTRUIR URL
  const url = `${API_URL}${path}`;

  console.log("URL solicitada:", url);
  console.log("Método HTTP:", method);

  // REALIZAR PETICIÓN
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization:
        `Bearer ${data.session.access_token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const result = await response.json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.error || `Error HTTP ${response.status}`
    );
  }

  return result;
}


function showAppointmentDetails(event) {
  selectedAppointmentId = event.id;

  const details = event.extendedProps;

  document.getElementById("detail-name")
    .textContent = details.nombre || "";

  document.getElementById("detail-phone")
    .textContent = details.telefono || "";

  document.getElementById("detail-service")
    .textContent = details.servicio || "";

  const start = event.startStr.slice(0, 16);
  const end = event.endStr.slice(0, 16);

  document.getElementById("detail-schedule")
    .textContent = `${start} a ${end}`;

  document.getElementById("new-day")
    .value = start.slice(0, 10);

  document.getElementById("new-time")
    .value = start.slice(11, 16);

  appointmentDialog.showModal();
}

document.getElementById("close-appointment")
  .addEventListener("click", () => {
    appointmentDialog.close();
  });

document.getElementById("cancel-appointment")
  .addEventListener("click", async () => {
    if (!selectedAppointmentId) return;

    const confirmed = confirm(
      "¿Deseas cancelar esta cita? " +
      "El horario quedará disponible nuevamente."
    );

    if (!confirmed) return;

    try {
      await adminRequest(
        `/api/admin/citas/${selectedAppointmentId}`,
        "PATCH",
        { estado: "cancelada" }
      );

      appointmentDialog.close();
      calendar.refetchEvents();
      showMessage("Cita cancelada correctamente");

    } catch (error) {
      showMessage(error.message);
    }
  });


document.getElementById("reschedule-form")
  .addEventListener("submit", async event => {
    event.preventDefault();

    if (!selectedAppointmentId) {
      showMessage("Selecciona una cita");
      return;
    }

    const day =
      document.getElementById("new-day").value;

    const time =
      document.getElementById("new-time").value;

    if (!day || !time) {
      showMessage("Selecciona fecha y hora");
      return;
    }

    const confirmed = confirm(
      `¿Reprogramar la cita al ${day} a las ${time}?`
    );

    if (!confirmed) return;

    const submitButton =
      event.currentTarget.querySelector(
        'button[type="submit"]'
      );

    if (submitButton) submitButton.disabled = true;

    try {
      const result = await adminRequest(
        `/api/admin/citas/${selectedAppointmentId}`,
        "PATCH",
        {
          estado: "confirmada",
          day: day,
          time: time
        }
      );

      console.log("Reprogramación correcta:", result);

      appointmentDialog.close();

      calendar.gotoDate(day);
      calendar.refetchEvents();

      showMessage("Cita reprogramada correctamente");

    } catch (error) {
      console.error("Error reprogramando cita:", error);
      showMessage(error.message);

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });


document.getElementById("new-block")
  .addEventListener("click", () => {
    blockDialog.showModal();
  });

document.getElementById("close-block")
  .addEventListener("click", () => {
    blockDialog.close();
  });

const blockAllDay =
  document.getElementById("block-all-day");

blockAllDay.addEventListener("change", () => {
  document.getElementById("block-hours")
    .hidden = blockAllDay.checked;
});

document.getElementById("block-form")
  .addEventListener("submit", async event => {
    event.preventDefault();

    const payload = {
      day: document.getElementById("block-day").value,

      allDay: blockAllDay.checked,

      startTime:
        document.getElementById("block-start").value,

      endTime:
        document.getElementById("block-end").value,

      motivo:
        document.getElementById("block-reason").value
    };

    if (!confirm(
      "¿Deseas bloquear este horario?"
    )) return;

    try {
      await adminRequest(
        "/api/admin/bloqueos",
        "POST",
        payload
      );

      blockDialog.close();
      calendar.gotoDate(payload.day);
      calendar.refetchEvents();
      showMessage("Horario bloqueado correctamente");

    } catch (error) {
      showMessage(error.message);
    }
  });



initialize();
