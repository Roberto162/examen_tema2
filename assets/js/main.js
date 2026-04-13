const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");
const fondo = new Image();
fondo.src = "./assets/img/fondo_juego.avif";
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

let record = localStorage.getItem("record") || 0;
let fuegos = [];
let objetos = [];
let score = 0;
let salud = 100;
let nivel = 1;
let tiempo = 0;
let juegoActivo = false;
let intervaloObjetos;
let efectos = [];
const gravedadBase = 2;

const textoIntro = document.getElementById("textoIntro");
const mensajeFinal = document.getElementById("mensajeFinal");
const btnComenzar = document.getElementById("btnComenzar");
const pantallaInicio = document.getElementById("pantallaInicio");
const sonidoIntro = document.getElementById("sonidoIntro");

const texto = `Haz clic en la basura para ganar puntos

    ⚠️ Evita los objetos radioactivos o perderás salud
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

    document.body.classList.add("jugando");

    // 👇 OCULTAR TÍTULO SOLO EN JUEGO
    const titulo = document.querySelector(".tituloGame");
    if (titulo) titulo.style.display = "none";

    document.body.classList.add("jugando");

    juegoActivo = true;

    // 👇 INICIAR GENERACIÓN
    intervaloObjetos = setInterval(generarObjetos, 1200);


    gameLoop();
}
function detenerJuego() {
    juegoActivo = false;

    clearInterval(intervaloObjetos);

    objetos = []; // 👈 limpia pantalla
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

    // SOLO basura daña
    if (obj.tipo === "basura" || obj.tipo === "grupo") {
    salud -= 5;
}

    // efecto fuego 🔥
    crearFuego(obj.x, canvas.height - 10);

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

            crearImpacto(obj.x + obj.size / 2, obj.y + obj.size / 2);

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

    if (!juegoActivo) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

    actualizarObjetos();
    actualizarNivel();

    objetos.forEach(obj => dibujarObjeto(obj));

    if (salud <= 0) {
    mostrarPantallaFinal();
    return;
}

    // 🔥 FUEGO
    actualizarFuego();
    dibujarFuego();
    actualizarImpacto();
dibujarImpacto();

    dibujarHUD();

    tiempo++;

    requestAnimationFrame(gameLoop);
}

function dibujarHUD() {

    // Fondo
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(10, 10, 170, 90);

    // 👇 TEXTO MÁS GRANDE
    ctx.fillStyle = "#00ffe0";
    ctx.font = "16px Orbitron";

    ctx.fillText("Nivel: " + nivel, 15, 30);
    ctx.fillText("Score: " + score, 15, 50);
    ctx.fillText("Record: " + record, 15, 70);

    // Barra de vida
    ctx.fillStyle = "#333";
    ctx.fillRect(15, 78, 120, 8);

    ctx.fillStyle = "#00ff00";
    ctx.fillRect(15, 78, salud * 1.2, 8);

    if (score > record) {
    record = score;
    localStorage.setItem("record", record);
}
}

function ajustarCanvas() {

    const navbar = 60;
    const footer = 60;

    canvas.width = window.innerWidth * 0.97;
    canvas.height = window.innerHeight - navbar - footer - 6; // 👈 menos espacio
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

function actualizarNivel() {
    nivel = Math.floor(score / 200) + 1;
}

function generarObjetos() {

    if (!juegoActivo) return;

    if (objetos.length > 25) return; // 👈 límite anti acumulación

    let cantidad = 1 + Math.floor(nivel / 2);

    for (let i = 0; i < cantidad; i++) {
        crearObjeto();
    }
}

function crearFuego(x, y) {
    for (let i = 0; i < 8; i++) {
        fuegos.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * -2,
            size: Math.random() * 6 + 4,
            vida: 30
        });
    }
}
function actualizarFuego() {

    fuegos.forEach((f, i) => {
        f.x += f.vx;
        f.y += f.vy;
        f.vida--;

        if (f.vida <= 0) {
            fuegos.splice(i, 1);
        }
    });
}
function dibujarFuego() {

    fuegos.forEach(f => {

        ctx.fillStyle = "orange";

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {
        // 🔴 Usuario se fue
        clearInterval(intervaloObjetos);
    } else {
        // 🟢 Usuario volvió
        intervaloObjetos = setInterval(generarObjetos, 1200);
    }

});

function crearImpacto(x, y) {

    for (let i = 0; i < 10; i++) {
        efectos.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 5 + 3,
            vida: 20
        });
    }
}
function actualizarImpacto() {
    efectos.forEach((e, i) => {
        e.x += e.vx;
        e.y += e.vy;
        e.vida--;

        if (e.vida <= 0) efectos.splice(i, 1);
    });
}

function dibujarImpacto() {
    efectos.forEach(e => {
        ctx.fillStyle = `rgba(0,255,200,${e.vida / 20})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function mostrarPantallaFinal() {

    detenerJuego();

    document.getElementById("pantallaFinal").style.display = "flex";

    document.getElementById("finalScore").textContent = "Score: " + score;
    document.getElementById("finalRecord").textContent = "Record: " + record;
}

document.getElementById("btnReiniciar").addEventListener("click", () => {

    location.reload(); // fácil y seguro
});

setTimeout(() => {
    const btn = document.getElementById("btnReiniciar");
    if (btn) {
        btn.addEventListener("click", () => {
            location.reload();
        });
    }
}, 500);

pantallaInicio.style.display = "none";