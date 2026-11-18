
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

          const citas = await fetchAdminCitas(info);

          const events = citas.map(cita => ({
            id: String(cita.id),
            title: cita.title,
            start: cita.start,
            end: cita.end,
            extendedProps: cita.extendedProps || {}
          }));

          success(events);
        } catch (error) {
          showMessage(error.message);
          failure(error);
        }
      },

      eventClick(info) {
        /*const cita = info.event;

        alert(
          `Cita: ${cita.title}\n` +
          `Inicio: ${cita.start?.toLocaleString("es-MX")}`
        );*/
        showAppointmentDetails(info.event);
      }
    }
  );

  calendar.render();
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
    !["PATCH", "POST"].includes(method)
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
          day,
          time
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
      showMessage("Horario bloqueado correctamente");

    } catch (error) {
      showMessage(error.message);
    }
  });



initialize();
