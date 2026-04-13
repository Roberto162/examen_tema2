const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");
const fondo = new Image();
fondo.src = "/assets/img/fondojuego.jpg";
const imagenes = {

    basura: [
        cargarImagen("./assets/img/manzana.png"),
        cargarImagen("./assets/img/platano.png"),
        cargarImagen("./assets/img/plastico.png")
    ],

    grupo: cargarImagen("./assets/img/bolsa_basura.png"),

    vidrio: [
        cargarImagen("./assets/img/peligro.png"),
        cargarImagen("./assets/img/peligro2.png")
    ],

    botiquin: cargarImagen("./assets/img/botiquin.png")
};

function cargarImagen(src) {
    const img = new Image();
    img.src = src;
    return img;
}

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
     document.body.classList.add("jugando"); // 👈 activa modo juego
    gameLoop();
}

//Logica del juego
function crearObjeto() {

    let tipo;
    let rand = Math.random();

    if (rand < 0.65) tipo = "basura";
    else if (rand < 0.85) tipo = "vidrio";
    else if (rand < 0.95) tipo = "grupo";
    else tipo = "botiquin";

    let img;

    if (tipo === "basura") {
        img = imagenes.basura[Math.floor(Math.random() * imagenes.basura.length)];
    }

    if (tipo === "vidrio") {
        img = imagenes.vidrio[Math.floor(Math.random() * imagenes.vidrio.length)];
    }

    if (tipo === "grupo") {
        img = imagenes.grupo;
    }

    if (tipo === "botiquin") {
        img = imagenes.botiquin;
    }

    let objeto = {
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() * 0.6 - 0.3),
        vy: Math.random() * 0.5 + 0.8 + (nivel * 0.2),
        size: tipo === "grupo" ? 60 : 45, // grupo más grande 👀
        tipo: tipo,
        img: img,

        viento: Math.random() < 0.4,
        curva: Math.random() * 0.05
    };

    objetos.push(objeto);
}
function dibujarObjeto(obj) {

    ctx.drawImage(
        obj.img,
        obj.x,
        obj.y,
        obj.size,
        obj.size
    );
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

if (obj.tipo === "grupo") score += 25; // más puntos 🔥

if (obj.tipo === "vidrio") salud -= 15;

if (obj.tipo === "botiquin") {
    salud += 15;
    if (salud > 100) salud = 100;
}

            objetos.splice(index, 1);
        }
    });
});
function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    actualizarObjetos();
    actualizarNivel();

    objetos.forEach(obj => dibujarObjeto(obj));

    dibujarHUD(); // 👈 AHORA VA AQUÍ

    tiempo++;

    requestAnimationFrame(gameLoop);
}

function dibujarHUD() {

    // Fondo
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(10, 10, 150, 80);

    // Texto principal (más grande)
    ctx.fillStyle = "#00ffe0";
    ctx.font = "13px Orbitron";

    ctx.fillText("Nivel: " + nivel, 15, 25);
    ctx.fillText("Score: " + score, 15, 40);
    ctx.fillText("Record: " + record, 15, 55);

    // Barra de vida
    ctx.fillStyle = "#333";
    ctx.fillRect(15, 65, 110, 6);

    ctx.fillStyle = "#00ff00";
    ctx.fillRect(15, 65, salud * 1.1, 6);
}

function ajustarCanvas() {

    const navbar = 40;
    const footer = 60;

    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight - navbar - footer-35;
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

function actualizarNivel() {
    nivel = Math.floor(score / 200) + 1;
}

function generarObjetos() {

    let cantidad = 1 + Math.floor(nivel / 2); 
    // nivel 1 → 1 objeto
    // nivel 4 → 3 objetos

    for (let i = 0; i < cantidad; i++) {
        crearObjeto();
    }
}

setInterval(generarObjetos, 1200);