
const SUPABASE_URL =
  "https://wqwdcbsfvhohqjpbdcoa.supabase.co/rest/v1/";

const SUPABASE_KEY = "sb_publishable_tJRZ4vIS6US2n9GTyiUeQQ_t3_M3O0A";

const API_URL =
  "https://michellspa-api.onrender.com";

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
            end: cita.end
          }));

          success(events);
        } catch (error) {
          showMessage(error.message);
          failure(error);
        }
      },

      eventClick(info) {
        const cita = info.event;

        alert(
          `Cita: ${cita.title}\n` +
          `Inicio: ${cita.start?.toLocaleString("es-MX")}`
        );
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

    if (error) {
      throw new Error("Correo o contraseña incorrectos");
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

initialize();
