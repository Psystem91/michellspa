function opnServ(catalogo){
    console.log("opcion seleccionada:", catalogo);
    switch(catalogo){
        case "facial":
            addMessage("Seleccionaste Tratamiento Facial", "user");
            setTimeout(function(){
                addMessage(
                    `Tratamiento Facial Ofrece:
                    <ul>
                        <li>🧖‍♀️ Limpieza facial profunda</li>
                        <li>✨ Hollywood Peel Láser</li>
                        <li>🌸 Limpieza Facial Antiedad</li>        
                    </ul>
                    ¿Por cual servicio estas interesado?
                    <br><br>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>
                    `, "bot"
                )
            },1000);
            break;
        
        case "uñas":
            addMessage("Seleccionaste Uñas", "user");
            setTimeout(function(){
                addMessage(
                    `Tratamiento de Uñas ofrece:
                    <ul>
                        <li>💅 Manicura Spa</li>
                        <li>🦶 Pedicura</li>
                        <li>✨ Gel Semipermanente</li>        
                        <li>💅🏼 Rubber</li>        
                    </ul>
                    ¿Por cual servicio estas interesado?
                    <br><br>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>
                    `, "bot"
                )
            },1000);
            break;

        case "masajes":
            addMessage("Seleccionaste Masajes", "user");
            setTimeout(function(){
                addMessage(
                    `Nuestros Masajes son:
                    <ul>
                        <li>🌿 Masaje relajante corto</li>
                        <li>🌿 Masaje relajante cuerpo completo</li>
                        <li>💑 Masaje relajante en pareja</li>
                        <li>💆‍♀️ Masaje mixto corto </li>
                        <li>💆‍♀️ Masaje mixto cuerpo completo</li>
                        <li>💪 Masaje descontracturante corto</li>
                        <li>🫧 Masaje con ventosas corto</li>
                        <li>🫧 Masaje con ventosas completo</li>
                        <li>🍫 Chocolaterapia</li>
                        <li>🎋 Bambuterapia</li>
                        <li>🦶 Reflexología podal</li>
                        <li>🪑 Shiatsu en silla</li>
                    </ul>
                    ¿Por cual servicio estas interesado?
                    <br><br>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>
                    `, "bot"
                )
            },1000);
            break;

        case "cuidaCorpo":
            addMessage("Seleccionaste Cuidado Corporal", "user");
            setTimeout(function(){
                addMessage(
                    `Tratamiento Corporal Ofrece:
                    <ul>
                        <li>✨ Despigmentación Laser</li>
                        <li>✨ Depilación Laser Definitiva Soprano Alma</li>
                        <li>💨 Presoterapia</li>
                        <li>⚡  Gimnasia Pasiva</li>
                        <li>📦 Paquete Reductor de Aparatologia </li>
                        <li>🏏 Maderoterapia Reductiva</li>
                        <li>🏏 Maderoterapia Completa</li>
                        <li>🇻🇪 Manual Colombiano</li>
                        <li>🔥 Sauna</li>
                    </ul>
                    ¿Por cual servicio estas interesado?
                    <br><br>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>
                    `, "bot"
                )
            },1000);
            break;
    };
};

function botResponse(text){
    const message = text
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .trim();
    switch(true){    
        case message.includes("hollywood"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, HOLLYWOOD PEEL LASER, 
                ¿Que dia tienes disponible?`;
            addMessage(
                `Tratamiento que ayuda a disminuir la apariencia del poro y textura, aportando un efecto de 
                piel más uniforme y 2 tonos más claro.
                <br><br>
                <div style="margin: 8px 0; padding-left: 0">Duración de 80 min por tan solo $1500 MXN</div>
                <br><br>
                <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                    📅 Agendar una cita
                </button>
                <button id="opnFaci" class="servOpn" onclick="opnServ('facial')">
                    <span class="option-icon">💆🏻‍♀️</span>
                    <span class="option-text">Cuidado Facial</span>
                </button>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>
                `, "bot"
            );
            return;
        case message.includes("hola"):
            addMessage(
                `👋 ¡Hola!, soy SpaBot 🤖
                <br><br>
                Selecciona una opcion de nuestro Menu de inicio
                <br><br>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>`, "bot"
            );
            return;
        case message.includes("depilacion") || message.includes("laser") || message.includes("despigmentacion"):
            if (message.includes("despigmentacion laser") || message.includes("despigmentacion")) {
                mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, DESPIGMENTACION LASER, 
                ¿Que dia tienes disponible?`;
                addMessage(
                `Tratamiento dirigido a disminuir la apariencia de manchas faciales y corporales y ayudar a 
                lograr un tono de piel más uniforme conforme a las sesiones.
                <br><br>
                <div style="margin: 8px 0; pandding-left: 0">PRECIO SEGÚN TAMAÑO DE MANCHA</div>
                <br><br>
                <button id="btnOperador" class="servOpn" onclick="selectOption('operador')">
                    💬 Hablar con un asesor
                </button>
                <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                    <span class="option-icon">🧴</span>
                    <span class="option-text">Cuidado Corporal</span>
                    </button>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>`, "bot"
            );
            } else if (message.includes("depilacion laser definitiva soprano alma") || message.includes("depilacion laser")) {
                mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, DEPILACION LASER DEFINITIVA, 
                ¿Que dia tienes disponible?`;
                addMessage(
                `Tecnología láser que actúa sobre el folículo del vello para lograr una reducción progresiva 
                y duradera.
                <br><br>
                <div style="margin: 8px 0; pandding-left: 0">Se trabaja por áreas y el tratamiento consta de 8 sesiones</div>
                <br><br>
                <img src="Imagenes/depilacionLaser.jpg" alt="Depilación Láser" style="width: 100%; max-width: 300px; margin-bottom: 12px;">
                <br><br>
                <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                    📅 Agendar una cita
                </button>
                <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                    <span class="option-icon">🧴</span>
                    <span class="option-text">Cuidado Corporal</span>
                    </button>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>`, "bot"
            );
            } else {
                addMessage(
                `Indícame de cuál quieres información:
                <div style="font-style: italic; font-weight: bold;">
                    "Ejem: Depilacion Laser"
                </div>
                <ul style="list-style: none; padding-left: 0">
                    <li>☑️ Despigmentacion Laser</li>
                    <li>☑️ Depilacion Laser</li>
                </ul>`, "bot"
            );
            }; 
            return;
        case message.includes("presoterapia"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, PRESOTERAPIA, 
                ¿Que dia tienes disponible?`;
                addMessage(
                    `Ayuda a estimular la circulación y el drenaje de líquidos, favoreciendo la sensación de 
                    piernas más ligeras y descansadas, ayuda a combatir celulitis y varices.
                    <br><br>
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 45 min por tan solo $500 MXN</div>
                    <br><br>
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                        <span class="option-icon">🧴</span>
                        <span class="option-text">Cuidado Corporal</span>
                        </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`, "bot"
                );
                return;
        case message.includes("gimnasia pasiva")|| message.includes("gimnasia"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, GIMNASIA PASIVA, 
                ¿Que dia tienes disponible?`;
                addMessage(
                    `Estimulación muscular mediante aparatología que genera contracciones musculares. Es un complemento 
                    para tonificación y tratamientos corporales.
                    <br><br>
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 30 min por tan solo $350 MXN</div>
                    <br><br>
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                        <span class="option-icon">🧴</span>
                        <span class="option-text">Cuidado Corporal</span>
                        </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`, "bot"
                );
                return;
        case message.includes("paquete") || message.includes("paquete reductor de aparatologia"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, PAQUETE REDUCTOR DE APARATOLOGIA, 
                ¿Que dia tienes disponible?`;
                addMessage(
                    `Consta de 16 sesiones divididas en 5 citas, aplicamos Cavitacion mueve el adoposito de grasa 
                    radiofrecuencia ayuda a la celulitis y la flacidez vacumterapia moldea la figura con succión termica.
                    <br><br>
                    <div style="margin: 8px 0; pandding-left: 0">Cada cita tiene duración de 60 min, promoción por tan solo $2,500 MXN</div>
                    <br><br>
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                        <span class="option-icon">🧴</span>
                        <span class="option-text">Cuidado Corporal</span>
                        </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`, "bot"
                );
                return;
        case message.includes("maderoterapia"):
            if (message.includes("reductiva")) {
                mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MADEROTERAPIA REDUCTIVA, 
                ¿Que dia tienes disponible?`;
                addMessage(
                    `Tratamiento corporal moldeadora de silueta o levanta glúteos.
                    <br><br>
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 45 min por tan solo $600 MXN</div>
                    <br><br>
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                        <span class="option-icon">🧴</span>
                        <span class="option-text">Cuidado Corporal</span>
                        </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`, "bot"
                );
            } else if (message.includes("completa")) {
                mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MADEROTERAPIA COMPLETA, 
                ¿Que dia tienes disponible?`;
                addMessage(
                    `Tratamiento de cuerpo completo en donde se usan maderos para ayudar a la circulación sanguínea, 
                    piernas cansadas y varices.
                    <br><br>
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 60 min por tan solo $600 MXN</div>
                    <br><br>    
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                        <span class="option-icon">🧴</span>
                        <span class="option-text">Cuidado Corporal</span>
                        </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`, "bot"
                );
            } else {
                addMessage(
                    `Indícame de cuál quieres información:
                    <div style="font-style: italic; font-weight: bold;">
                        "Ejem:"
                    </div>
                    <ul style="list-style: none; padding-left: 0">
                        <li>☑️ Maderoterapia Reductiva</li>
                        <li>☑️ Maderoterapia Completa</li>
                    </ul>`, "bot"
                );
            }; 
            return;
        case message.includes("manual"):
            if (message.includes("colombiano")) {
               mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MANUAL COLOMBIANO, 
                ¿Que dia tienes disponible?`; 
                addMessage(
                    `Masaje reductor con técnica colombiana manual que ayuda a moldear y reducir tallas, terapia 
                    de tejido profundo.
                    <br><br>
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 45 min por tan solo $600 MXN</div>
                    <br><br>    
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                        <span class="option-icon">🧴</span>
                        <span class="option-text">Cuidado Corporal</span>
                        </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`, "bot"
                );
            } else {
                mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MANUAL COLOMBIANO, 
                ¿Que dia tienes disponible?`; 
                addMessage(
                    `Masaje reductor con técnica colombiana manual que ayuda a moldear y reducir tallas, terapia 
                    de tejido profundo.
                    <br><br>
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 45 min por tan solo $600 MXN</div>
                    <br><br>    
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                        <span class="option-icon">🧴</span>
                        <span class="option-text">Cuidado Corporal</span>
                        </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`, "bot"
                );
            };
            return;
        case message.includes("sauna"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, SAUNA, 
                ¿Que dia tienes disponible?`;
                addMessage(
                    `Ayuda a generar relajación, favorecer la eliminación de toxinas, es un complemento excelente de masaje.
                    <br><br>
                    <div style="margin: 8px 0; pandding-left: 0">Cada cita tiene duración de 20 a 40 min, por tan solo $450 MXN</div>
                    <br><br>
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('cuidaCorpo')">
                        <span class="option-icon">🧴</span>
                        <span class="option-text">Cuidado Corporal</span>
                        </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>`, "bot"
                );
            return;
        case message.includes("manicura") || message.includes("manicura spa"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MANICURA SPA, 
                ¿Que dia tienes disponible?`;
            addMessage(
                `Cuidado y embellecimiento de manos y uñas, incluyendo limpieza, forma y arreglo de cutículas.
                <br><br>
                <div style="margin: 8px 0; pandding-left: 0">De regalo un tono de gel por $550 MXN</div>
                <br><br>
                <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                    📅 Agendar una cita
                </button>
                <button id="opnCorp" class="servOpn" onclick="opnServ('uñas')">
                    <span class="option-icon">💅</span>
                    <span class="option-text">Uñas</span>
                </button>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>
                `, "bot"
            );
            return;
        case message.includes("pedicura"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, PEDICURA SPA, 
                ¿Que dia tienes disponible?`;
            addMessage(
                `Cuidado integral de pies y uñas, ayudando a mantenerlos limpios, suaves y estéticamente cuidados.
                <br><br>
                <div style="margin: 8px 0; pandding-left: 0">De regalo un tono de gel por $550 MXN</div>
                <br><br>
                <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                    📅 Agendar una cita
                </button>
                <button id="opnCorp" class="servOpn" onclick="opnServ('uñas')">
                    <span class="option-icon">💅</span>
                    <span class="option-text">Uñas</span>
                </button>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>
                `, "bot"
            );
            return;
        case message.includes("gel"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, GEL SEMIPERMANENTE, 
                ¿Que dia tienes disponible?`;
            addMessage(
                `Aplicación de gel sobre la uña natural para obtener un acabado brillante y duradero, con 
                diferentes colores y diseños disponibles.
                <br><br>
                <div style="margin: 8px 0; pandding-left: 0">Un tono por $180 MXN, dos tonos por $250 MXN</div>
                <div style="margin: 8px 0; pandding-left: 0">Diseños bajo cotización</div>
                <br><br>
                <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                    📅 Agendar una cita
                </button>
                <button id="opnCorp" class="servOpn" onclick="opnServ('uñas')">
                    <span class="option-icon">💅</span>
                    <span class="option-text">Uñas</span>
                </button>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>
                `, "bot"
            );
            return;
        case message.includes("rubber"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, RUBBER, 
                ¿Que dia tienes disponible?`;
            addMessage(
                `Tratamiento de uñas que encapsulan la uña para evitar quiebres y dejar que crezca la uña 
                natural, aplicando el color de preferencia.
                <br><br>
                <div style="margin: 8px 0; pandding-left: 0">Un tono de gel por $400 MXN</div>
                <br><br>
                <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                    📅 Agendar una cita
                </button>
                <button id="opnCorp" class="servOpn" onclick="opnServ('uñas')">
                    <span class="option-icon">💅</span>
                    <span class="option-text">Uñas</span>
                </button>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>
                `, "bot"
            );
            return;
    };
    switch(true){
        case message.includes("chocolaterapia"):
                mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, CHOCOLATERAPIA, 
                    ¿Que dia tienes disponible?`;
                addMessage(
                    `Experiencia corporal única que combina la técnica de masaje de 3 tiempos, (exfoliación, masaje chocolate, 
                    masaje de sellado con crema) productos a base de chocolate orgánico dejando la piel suave y relajación total.
                    <br><br>
                    Incluye:
                    <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                        <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                        <li>Boca Arriba: Rostro, cuello, hombros, pectoral, abdomen, piernas, pantorrilla delantera y pies.</li>
                    </ul>   
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 80 min por tan solo $1500 MXN</div>
                    <br><br>
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                        <span class="option-icon">🧖🏻‍♀️</span>
                        <span class="option-text">Masajes</span>
                    </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>
                    `, "bot"
                );
                return;
        case message.includes("bambuterapia"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, BAMBUTERAPIA, 
                ¿Que dia tienes disponible?`;
            addMessage(
                `Masaje relajante realizado con cañas de bambú que ayuda a trabajar la tensión muscular y proporcionar 
                relajación corporal completa.
                <br><br>
                Incluye:
                <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                    <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                    <li>Boca Arriba: Rostro, cuello, hombros, pectoral, abdomen, piernas, pantorrilla delantera y pies.</li>
                </ul>   
                <div style="margin: 8px 0; pandding-left: 0">Duración de 80 min por tan solo $850 MXN</div>
                <br><br>
                <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                    📅 Agendar una cita
                </button>
                <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                    <span class="option-icon">🧖🏻‍♀️</span>
                    <span class="option-text">Masajes</span>
                </button>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>
                `, "bot"
            );
            return;
        case message.includes("reflexologia"):
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, REFLEXOLOGIA PODAL, 
                ¿Que dia tienes disponible?`;
            addMessage(
                `Técnica de masaje enfocada en los pies para favorecer la relajación y aliviar la sensación de 
                cansancio, al mismo tiempo aliviando molestias en órganos espejo conectado por el sistema nervioso.
                <br><br>
                Incluye:
                <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                    <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                </ul>   
                <div style="margin: 8px 0; pandding-left: 0">Duración de 60 min por tan solo $400 MXN</div>
                <br><br>
                <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                    📅 Agendar una cita
                </button>
                <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                    <span class="option-icon">🧖🏻‍♀️</span>
                    <span class="option-text">Masajes</span>
                </button>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>
                `, "bot"
            );
            return;
        case message.includes("shiatsu"): 
            mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, SHIATSU EN SILLA, 
                ¿Que dia tienes disponible?`;           
            addMessage(
                `Masaje realizado en silla ergonómica, enfocado principalmente en espalda, cuello y hombros para 
                liberar tensión y proporcionar relajación se puede trabajar con ropa puesta.
                <br><br>
                Incluye:
                <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                    <li style="margin-bottom: 8px";>Silla ergonomica, espalda, cuello y hombros.</li>
                </ul>   
                <div style="margin: 8px 0; pandding-left: 0">Duración de 30 min por tan solo $400 MXN</div>
                <br><br>
                <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                    📅 Agendar una cita
                </button>
                <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                    <span class="option-icon">🧖🏻‍♀️</span>
                    <span class="option-text">Masajes</span>
                </button>
                <button class="servOpn" onclick="menuPrincipal()">
                    🏠 Menú principal
                </button>
                `, "bot"
            );
            return;
        default:
            addMessage(
            `¿Me ayudas a especificar mejor el servicio que necesitas?, por favor.
            <br><br>
            <div style="font-style: italic; font-weight: bold;">
                "Ejem: Masaje Relajante Corto, Masaje mixto cuerpo completo"
            </div>
            <br><br>
            Selecciona una opcion de nuestro Menu de inicio
            <br><br>
            <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
            <span class="option-icon">🧖🏻‍♀️</span>
            <span class="option-text">Masajes</span>
            </button>`, "bot"
        );
    };
    if (message.includes("masaje") == true){
        console.log("mensaje contiene la palabra masaje");
        switch(true){
            case message.includes("relajante"):
                if (message.includes("masaje relajante corto")) {
                    mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MASAJE RELAJANTE CORTO, 
                    ¿Que dia tienes disponible?`;
                    addMessage(
                        `El masaje relajante corto, es ideal para liberar tensión, disminuir el estrés y proporcionar 
                        una profunda sensación de relajación.
                        <br><br>
                        Incluye:
                        <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                            <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                        </ul>
                        <div style="margin: 8px 0; pandding-left: 0">Duración de 60 min por tan solo $550 MXN</div>
                        <br><br>
                        <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                            📅 Agendar una cita
                        </button>
                        <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                            <span class="option-icon">🧖🏻‍♀️</span>
                            <span class="option-text">Masajes</span>
                        </button>
                        <button class="servOpn" onclick="menuPrincipal()">
                            🏠 Menú principal
                        </button>
                        `, "bot"
                    );
                } else if (message.includes("masaje relajante cuerpo completo")) {
                    mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MASAJE RELAJANTE CUERPO COMPLETO, 
                    ¿Que dia tienes disponible?`;
                    addMessage(
                        `El masaje cuerpo completo, es ideal para liberar tensión, disminuir el estrés y proporcionar una profunda 
                        sensación de relajación en todo el cuerpo acompañado de aromaterapia.
                        <br><br>
                        Incluye:
                        <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                            <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                            <li>Boca Arriba: Rostro, cuello, hombros, pectoral, abdomen, piernas, pantorrilla delantera y pies.</li>
                        </ul>
                        <div style="margin: 8px 0; pandding-left: 0">Duración de 80 min por tan solo $850 MXN</div>
                        <br><br>
                        <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                            📅 Agendar una cita
                        </button>
                        <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                            <span class="option-icon">🧖🏻‍♀️</span>
                            <span class="option-text">Masajes</span>
                        </button>
                        <button class="servOpn" onclick="menuPrincipal()">
                            🏠 Menú principal
                        </button>
                        `, "bot"
                    );
                } else if (message.includes("masaje en pareja")) {
                    mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MASAJE RELAJANTE EN PAREJA, 
                    ¿Que dia tienes disponible?`;
                    addMessage(
                        `El masaje en pareja, es experiencia de relajación para dos personas, ideal para compartir un 
                        momento de descanso y bienestar juntos.
                        <br><br>
                        Incluye:
                        <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                            <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                        </ul>
                        <div style="margin: 8px 0; pandding-left: 0">Duración de 60 min por tan solo $900 MXN</div>
                        <br><br>
                        <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                            📅 Agendar una cita
                        </button>
                        <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                            <span class="option-icon">🧖🏻‍♀️</span>
                            <span class="option-text">Masajes</span>
                        </button>
                        <button class="servOpn" onclick="menuPrincipal()">
                            🏠 Menú principal
                        </button>
                        `, "bot"
                    );
                } else {
                    addMessage(`Indícame de cuál quieres información:
                        <div style="font-style: italic; font-weight: bold;">
                            Ejem:
                        </div>
                        <ul style="list-style: none; padding-left: 0">
                            <li>☑️ Masaje Relajante Corto</li>
                            <li>☑️ Masaje Cuerpo Completo</li>
                            <li>☑️ Masaje En pareja</li>
                        </ul>`,
                        "bot"
                    );
                }; 
                break;
            case message.includes("masaje mixto"):
                if (message.includes("corto")) {
                    mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MASAJE MIXTO CORTO, 
                    ¿Que dia tienes disponible?`;
                    addMessage(
                        `El masaje mixto corto, combina diferentes técnicas de masaje para trabajar tensión muscular y proporcionar 
                        relajación y bienestar, es decir presión combinada para mejorar balance.
                        <br><br>
                        Incluye:
                        <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                            <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                        </ul>
                        <div style="margin: 8px 0; pandding-left: 0">Duración de 60 min por tan solo $650 MXN</div>
                        <br><br>
                        <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                            📅 Agendar una cita
                        </button>
                        <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                            <span class="option-icon">🧖🏻‍♀️</span>
                            <span class="option-text">Masajes</span>
                        </button>
                        <button class="servOpn" onclick="menuPrincipal()">
                            🏠 Menú principal
                        </button>
                        `, "bot"
                    );
                } else if (message.includes("cuerpo completo") || message.includes("completo")) {
                    mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MASAJE MIXTO CUERPO COMPLETO, 
                    ¿Que dia tienes disponible?`;
                    addMessage(
                        `El masaje cuerpo completo, combina diferentes técnicas de masaje para trabajar tensión muscular y al mismo 
                        tiempo proporcionar relajación y bienestar en todo el cuerpo.
                        <br><br>
                        Incluye:
                        <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                            <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                            <li>Boca Arriba: Rostro, cuello, hombros, pectoral, abdomen, piernas, pantorrilla delantera y pies.</li>
                        </ul>   
                        <div style="margin: 8px 0; pandding-left: 0">Duración de 80 min por tan solo $950 MXN</div>
                        <br><br>
                        <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                            📅 Agendar una cita
                        </button>
                        <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                            <span class="option-icon">🧖🏻‍♀️</span>
                            <span class="option-text">Masajes</span>
                        </button>
                        <button class="servOpn" onclick="menuPrincipal()">
                            🏠 Menú principal
                        </button>
                        `, "bot"
                    );
                } else {
                    addMessage(`Indícame de cuál quieres información:
                        <div style="font-style: italic; font-weight: bold;">
                            "Ejem: masaje mixto corto"
                        </div>
                        <ul style="list-style: none; padding-left: 0">
                            <li>☑️ Corto</li>
                            <li>☑️ Cuerpo Completo</li>
                        </ul>`,
                        "bot"
                    );
                }; 
                break;
            case message.includes("masaje descontracturante corto"):
                mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MASAJE DESCONTRACTURANTE CORTO, 
                    ¿Que dia tienes disponible?`;
                addMessage(
                    `El masaje descontracturante corto, es enfocado en zonas con tensión y contracturas musculares, ayudando a disminuir molestias y mejorar 
                    la sensación de movilidad.
                    <br><br>
                    Incluye:
                    <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                        <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                    </ul>   
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 60 min por tan solo $750 MXN</div>
                    <br><br>
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                        <span class="option-icon">🧖🏻‍♀️</span>
                        <span class="option-text">Masajes</span>
                    </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>
                    `, "bot"
                );
                break;
            case message.includes("masaje descontracturante"):
                mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MASAJE DESCONTRACTURANTE CORTO, 
                    ¿Que dia tienes disponible?`;
                addMessage(
                    `El masaje descontracturante corto, es enfocado en zonas con tensión y contracturas musculares, ayudando a disminuir molestias y mejorar 
                    la sensación de movilidad.
                    <br><br>
                    Incluye:
                    <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                        <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                    </ul>   
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 60 min por tan solo $750 MXN</div>
                    <br><br>
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                        <span class="option-icon">🧖🏻‍♀️</span>
                        <span class="option-text">Masajes</span>
                    </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>
                    `, "bot"
                );
                break;
            case message.includes("masaje con ventosas"):
                if (message.includes("corto") == true) {
                    mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MASAJE CON VENTOSAS CORTO, 
                    ¿Que dia tienes disponible?`;
                    addMessage(
                        `Es un masaje mixto en donde se utiliza ventosas para generar un efecto de succión sobre la piel y 
                        tejidos, ayudando a liberar tensión y favorecer la circulación local.
                        <br><br>
                        Incluye:
                        <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                            <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                        </ul>   
                        <div style="margin: 8px 0; pandding-left: 0">Duración de 60 min por tan solo $650 MXN</div>
                        <br><br>
                        <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                            📅 Agendar una cita
                        </button>
                        <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                            <span class="option-icon">🧖🏻‍♀️</span>
                            <span class="option-text">Masajes</span>
                        </button>
                        <button class="servOpn" onclick="menuPrincipal()">
                            🏠 Menú principal
                        </button>
                        `, "bot"
                    );
                }else if (message.includes("completo") == true) {                
                    mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, MASAJE CON VENTOSAS COMPLETO, 
                        ¿Que dia tienes disponible?`;
                    addMessage(
                        `Es un masaje mixto en donde se utiliza ventosas para generar un efecto de succión sobre la piel y 
                        tejidos, ayudando a liberar tensión y favorecer la circulación local.
                        <br><br>
                        Incluye:
                        <ul style="list-style: none; padding-left: 0; pandding: 0; margin: 12px 0">
                            <li style="margin-bottom: 8px";>Boca Abajo: Pies, piernas, brazos, hombros, cuello y espalda.</li>
                            <li>Boca Arriba: Rostro, cuello, hombros, pectoral, abdomen, piernas, pantorrilla delantera y pies.</li>
                        </ul>   
                        <div style="margin: 8px 0; pandding-left: 0">Duración de 80 min por tan solo $950 MXN</div>
                        <br><br>
                        <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                            📅 Agendar una cita
                        </button>
                        <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                            <span class="option-icon">🧖🏻‍♀️</span>
                            <span class="option-text">Masajes</span>
                        </button>
                        <button class="servOpn" onclick="menuPrincipal()">
                            🏠 Menú principal
                        </button>
                        `, "bot"
                    );
                }else {
                    addMessage(`Indícame de cuál quieres información:
                        <div style="font-style: italic; font-weight: bold;">
                            Ejem:
                        </div>
                        <ul style="list-style: none; padding-left: 0">
                            <li>☑️ Masaje Ventosas Corto</li>
                            <li>☑️ Masaje Ventosas Completo</li>
                        </ul>`,
                        "bot"
                    );
                };
            return;
        };
    }else if (message.includes("limpieza") == true){
        console.log("mensaje contiene la palabra limpieza");
        switch(true){
            case message.includes("limpieza facial profunda"):
                mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, LIMPIEZA FACIAL PROFUNDA, 
                    ¿Que dia tienes disponible?`;
                addMessage(
                    `Limpia profundamente la piel, elimina impurezas, puntos negros y células muertas, dejando el rostro 
                    más limpio, suave y luminoso.
                    <br><br>
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 80 min por tan solo $800 MXN</div>
                    <br><br>
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnFaci" class="servOpn" onclick="opnServ('facial')">
                        <span class="option-icon">💆🏻‍♀️</span>
                        <span class="option-text">Cuidado Facial</span>
                    </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>
                    `, "bot"
                );
                break;
            case message.includes("limpieza facial antiedad"):
                mensajeInfo = `Hola Michell Spa, quiero hacer una cita para, LIMPIEZA FACIAL ANTIEDAD, 
                    ¿Que dia tienes disponible?`;
                addMessage(
                    `Ayuda a hidratar y revitalizar la piel, mejorando la apariencia de líneas de expresión y signos 
                    de envejecimiento con ayuda de cromoterapia.
                    <br><br>
                    <div style="margin: 8px 0; pandding-left: 0">Duración de 80 min por tan solo $1200 MXN</div>
                    <br><br>
                    <button id="btnCita" class="servOpn" onclick="openWhatsapp()">
                        📅 Agendar una cita
                    </button>
                    <button id="opnFaci" class="servOpn" onclick="opnServ('facial')">
                        <span class="option-icon">💆🏻‍♀️</span>
                        <span class="option-text">Cuidado Facial</span>
                    </button>
                    <button class="servOpn" onclick="menuPrincipal()">
                        🏠 Menú principal
                    </button>
                    `, "bot"
                );
                break;
            default:
                addMessage(
                    `¿Me ayudas a especificar mejor el servicio que necesitas?, por favor.
                    <br><br>
                    <div style="font-style: italic; font-weight: bold;">
                        "Ejem: Limpieza Facil Antiedad"
                    </div>
                    <br><br>
                    Selecciona una opcion de nuestro Menu de inicio
                    <br><br>
                    <button id="opnCorp" class="servOpn" onclick="opnServ('masajes')">
                    <span class="option-icon">🧖🏻‍♀️</span>
                    <span class="option-text">Masajes</span>
                    </button>`, "bot"
                );
                break;
        };
    }else {
        addMessage(
            `¿Me ayudas a especificar mejor el servicio que necesitas?, por favor.
            <br><br>
            <div style="font-style: italic; font-weight: bold;">
                "Ejem: Masaje Relajante Corto, Limpieza Facial Profunda, Bambuterapia"
            </div>
            <br><br>
            Selecciona una opcion de nuestro Menu de inicio
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
            </button>`, "bot"
        );    
    };
};