const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");

let score = 0;
let salud = 100;
let record = 0;

const textoIntro = document.getElementById("textoIntro");
const mensajeFinal = document.getElementById("mensajeFinal");
const btnComenzar = document.getElementById("btnComenzar");
const pantallaInicio = document.getElementById("pantallaInicio");
const sonidoIntro = document.getElementById("sonidoIntro");

const texto = `
    Haz clic en la basura para ganar puntos

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
    console.log("Juego iniciado");
}