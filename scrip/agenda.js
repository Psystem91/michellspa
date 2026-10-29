const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());

document.getElementById("day").min = today;

//const { time } = require("node:console");

const form = document.getElementById("form");
const fields = document.getElementById("fields");
const search = document.getElementById("search");
const book = document.getElementById("book");
const slots = document.getElementById("slots");
const statusText = document.getElementById("status");
const nameInput = document.getElementById("name");
const phone = document.getElementById("phone");
const service = document.getElementById("service");
const day = document.getElementById("day");
const consent = document.getElementById("consent");
const website = document.getElementById("website");

fields.disabled = false;
book.disabled = true;
statusText.textContent = "Selecciona un tratamiento y una fecha";

function clearSlots(){
    slots.replaceChildren(new Option("Consulta una fecha", ""));
    slots.disabled = true;
    book.disabled = true;
}

service.addEventListener("change", clearSlots);
day.addEventListener("change", clearSlots);

search.addEventListener("click", async () => {
    if (!day.value){
        statusText.textContent = "Selecciona una fecha";
        return;
    }
    clearSlots();
    search.disabled = true;
    statusText.textContent = "Consultando disponibilidad...";
    try{
        const params = new URLSearchParams({
            day: day.value,
            service: service.value
        });
        const response = await fetch(`/api/availability?${params}`);
        //const response = await fetch(`http://localhost:3000/api/availability?${params}`);
        console.log(response);
        const data = await response.json();
        if(!response.ok)throw new Error(data.error);
        slots.replaceChildren(
            new Option("Selecciona una horario", "")
        );
        data.slots.forEach(time =>{
            slots.add(new Option(time, time));
        });
        slots.disabled = data.slots.length === 0;
        book.disabled = data.slots.length === 0;
        statusText.textContent = data.slots.length
        ? `${data.slots.length} horarios disponibles.`
        : "No hay horarios disponibles para esta fecha.";
    } catch (error) {
        statusText.textContent = error.message ||
        "No se pudieron consultar los horarios.";
    } finally {
        search.disabled = false;
    }
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!form.reportValidity() || !slots.value) {
    statusText.textContent = "Completa todos los campos.";
    return;
  }

  book.disabled = true;
  statusText.textContent = "Confirmando cita...";

  const booking = {
    name: nameInput.value.trim(),
    phone: phone.value.trim(),
    service: service.value,
    day: day.value,
    time: slots.value,
    consent: consent.checked,
    website: website.value
  };

  try {
    const response = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking)
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error);

    statusText.textContent =
      `¡Cita confirmada para el ${booking.day} a las ${booking.time}!`;

    form.reset();
    clearSlots();
  } catch (error) {
    statusText.textContent = error.message ||
      "No se pudo confirmar la cita.";
    book.disabled = false;
  }
});