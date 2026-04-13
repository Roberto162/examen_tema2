const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");

let objetos = [];
let score = 0;
let salud = 100;
let nivel = 1;
let tiempo = 0;

const gravedadBase = 2;

let record = 0;

const textoIntro = document.getElementById("textoIntro");
const mensajeFinal = document.getElementById("mensajeFinal");
const btnComenzar = document.getElementById("btnComenzar");
const pantallaInicio = document.getElementById("pantallaInicio");
const sonidoIntro = document.getElementById("sonidoIntro");

const texto = `Haz clic en la basura para ganar puntos

    ⚠️ Evita los vidrios o perderás salud
    ❤️ Los botiquines recuperan vida
    🎯 Sé rápido, cada vez aparecerán más objetos
    💀 Pierdes si tu salud llega a 0
`;

// Seleccionamos el párrafo de instrucciones y le aplicamos el estilo
const pInstrucciones = document.querySelector('.instrucciones');
pInstrucciones.style.whiteSpace = "pre-line"; 


// EFECTO MAQUINA DE ESCRIBIR
let i = 0;

function escribirTexto() {
    if (i < texto.length) {
        textoIntro.innerHTML += texto.charAt(i);
        i++;
        setTimeout(escribirTexto, 15);
    } else {
        mostrarMensajeFinal();
    }
}

// MOSTRAR MENSAJE FINAL
function mostrarMensajeFinal() {
    setTimeout(() => {
        mensajeFinal.classList.add("visible");
        sonidoIntro.play(); // sonido retro 🔊
    }, 1000);
}

window.onload = () => {
    document.body.classList.add("no-scroll"); // bloquear scroll
    escribirTexto();
};

btnComenzar.addEventListener("click", () => {

    pantallaInicio.classList.add("fade-out");

    setTimeout(() => {
        pantallaInicio.style.display = "none";

        document.body.classList.remove("no-scroll"); // activar scroll

        iniciarJuego();
    }, 1000);
});

// FUNCION BASE DEL JUEGO
function iniciarJuego() {
    gameLoop();
}

//Logica del juego
function crearObjeto() {

    let tipo;

    // Probabilidades
    let rand = Math.random();

    if (rand < 0.7) tipo = "basura";
    else if (rand < 0.9) tipo = "vidrio";
    else tipo = "botiquin";

    let objeto = {
        x: Math.random() * canvas.width,
        y: -20,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 + gravedadBase + nivel,
        size: 30,
        tipo: tipo
    };

    objetos.push(objeto);
}
function dibujarObjeto(obj) {

    ctx.font = "24px Arial";

    if (obj.tipo === "basura") ctx.fillText("🗑️", obj.x, obj.y);
    if (obj.tipo === "vidrio") ctx.fillText("⚠️", obj.x, obj.y);
    if (obj.tipo === "botiquin") ctx.fillText("❤️", obj.x, obj.y);
}
function actualizarObjetos() {

    objetos.forEach((obj, index) => {

        // Movimiento tipo lluvia + leve viento
        obj.x += obj.vx + Math.sin(tiempo * 0.05);
        obj.y += obj.vy;

        // Si toca el suelo
        if (obj.y > canvas.height) {

            if (obj.tipo === "basura") salud -= 5;
            if (obj.tipo === "vidrio") salud -= 10;

            objetos.splice(index, 1);
        }
    });
}

canvas.addEventListener("click", (e) => {

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    objetos.forEach((obj, index) => {

        if (
            mouseX > obj.x &&
            mouseX < obj.x + obj.size &&
            mouseY > obj.y &&
            mouseY < obj.y + obj.size
        ) {

            // ACCIONES SEGÚN TIPO
            if (obj.tipo === "basura") score += 10;
            if (obj.tipo === "vidrio") salud -= 15;
            if (obj.tipo === "botiquin") salud += 10;

            objetos.splice(index, 1);
        }
    });
});
function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    actualizarObjetos();

    objetos.forEach(obj => dibujarObjeto(obj));

    actualizarUI(); // 👈 AQUÍ

    tiempo++;

    requestAnimationFrame(gameLoop);
}
setInterval(() => {

    crearObjeto();

}, 1000 - (nivel * 100)); // más rápido en niveles altos

setInterval(() => {

    nivel++;

}, 10000); // cada 10 segundos sube nivel

function actualizarUI() {

    document.getElementById("score").innerText = score;

    let barra = document.getElementById("saludBarra");
    barra.style.width = salud + "%";

    if (salud <= 0) {
        alert("GAME OVER");
        location.reload();
    }
}

function ajustarCanvas() {
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.80;
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();