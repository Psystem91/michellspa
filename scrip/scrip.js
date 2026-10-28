let mensajeInfo = "";

const whatsappNumber = "525534810115"
//const whatsappNumber = "525532536329"
function openChat(){
    document.getElementById("chatContainer").style.display = "block";
}
function closeChat(){
    document.getElementById("chatContainer").style.display = "none";
    const chatMessenger = document.getElementById("chatMessenger");
    chatMessenger.innerHTML = "";
    addMessage(`👋 ¡Hola!, soy SpaBot 🤖 
                <br><br>
                Bienvenido a MICHELL SPA.
                <br><br>
                Selecciona una opcion del Menu`, "bot"
    );
    const opciones = document.createElement("div");
    opciones.classList.add("option");
    opciones.innerHTML = `
            <button id="btnServicios" class="option-button" onclick="selectOption('servicios')">
                💆 Nuestros Servicios
            </button>
            <button id="btnCita" class="option-button" onclick="selectOption('cita')">
                📅 Agendar una cita
            </button>                
    `;
    chatMessenger.appendChild(opciones);
    chatMessenger.scrollTop = chatMessenger.scrollHeight;
    
}
function addMessage(text, type){
    const chatMessages = document.getElementById("chatMessenger");
    const message = document.createElement("div");
    message.classList.add("message");
    message.classList.add(type);
    message.innerHTML = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function selectOption(option){
    console.log("opcion seleccionada:", option);
    switch(option){
        /*case "Informacion":
            addMessage("Solicitar Informacion","user");
            setTimeout(function(){
                addMessage(
                    `Claro ¿Que informacion necesitas
                    <br><br>
                    1️⃣ Masajes
                    <br><br>
                    2️⃣ Tratamiento Facial`,"bot")
            },1000);
            break;*/
        
        case "servicios":
            addMessage("Quiero conocer tus servicios","user");
            setTimeout(function(){
                addMessage(
                    `Nuestros Servicio son:
                    <br><br>
                    <button id="opnFaci" class="servOpn" onclick="opnServ('facial')">
                    <span class="option-icon">💆🏻‍♀️</span>
                    <span class="option-text">Cuidado Facial</span>
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                    <span class="option-icon">🧖🏻‍♀️</span>
                    <span class="option-text">Masajes</span>
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                    <span class="option-icon">🧴</span>
                    <span class="option-text">Cuidado Corporal</span>
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('uñas')">
                    <span class="option-icon">💅</span>
                    <span class="option-text">Uñas</span>
                    </button>
                    <br><br>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`,
                    "bot"
                )
            },1000);
            break;
        
        case "cita":
            addMessage("Quiero Agendar una Cita", "user");
            setTimeout(function(){
                addMessage(
                    `🚧 Agenda en Mantenimiento 💻⚙️
                    <br><br>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`, "bot"
                ) 
            },1000);
            break;
        
        case "operador":
            addMessage("Quiero hablar con un asesor", "user");
            setTimeout(function(){
                addMessage(
                    `Claro
                    <br><br>
                    Puedes continuar directamente con unos de nuestros asesores
                    <br><br>
                    <button id"operatorButton" class="servOpn" onclick="openWhatsapp()">📞 Abrir Whatsapp</button>
                    <br><br>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`, "bot"
                )
            },1000);
            break;

    }   
}

function sendMessage(){
    const input = document.getElementById("userInput");
    //console.log(input);
    const text = input.value.trim();
    if(text === ""){
        return;
    }
    addMessage(text,"user");
    input.value = "";
    setTimeout(function(){
        botResponse(text);
    },1000);
}

function openWhatsapp(){
    const mensajePredeterminado = "Hola Michell, buen dia, me comunique desde el Spabot 🤖 de la pagina web y necesito ayuda";
    const message = encodeURIComponent(
        mensajeInfo || mensajePredeterminado
    );
    const url = "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    message;
    window.open(url, "_blank");
}
document.getElementById("userInput").addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        sendMessage();
    }
});

function menuPrincipal(){
    const chatMessenger = document.getElementById("chatMessenger");
    chatMessenger.innerHTML = "";
    addMessage(`Selecciona una opcion del Menu Principal`, "bot"
    );
    const opciones = document.createElement("div");
    opciones.classList.add("option");
    opciones.innerHTML = `
        <button id="btnServicios" class="option-button" onclick="selectOption('servicios')">
                    💆 Nuestros Servicios
                </button>
                <button id="btnCita" class="option-button" onclick="selectOption('cita')">
                    📅 Agendar una cita
                </button>                
    `;
    chatMessenger.appendChild(opciones);
    chatMessenger.scrollTop = chatMessenger.scrollHeight;
}
