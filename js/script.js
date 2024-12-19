// Selección de elementos del DOM
const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const listaPuntuaciones = document.getElementById("lista-puntuaciones");
const nombreUsuarioElement = document.getElementById("nombre-usuario");
const botonComenzar = document.getElementById("boton-comenzar");
const contenedorJuego = document.getElementById("contenedor-juego");
const sonidos = {
    mover: document.getElementById("sonido-mover"),
    comer: document.getElementById("sonido-comer"),
    fin: document.getElementById("sonido-fin")
};
const selectorTematica = document.getElementById("tematica");
const tablaClasificacion = document.querySelector(".tabla-clasificacion");
const selectorTematicaDiv = document.querySelector(".selector-tematica");
const usuarioActualElement = document.createElement("div");
usuarioActualElement.classList.add("usuario-actual");

// Modal
const modal = document.getElementById("modal-alert");
const modalMessage = document.getElementById("modal-message");
const closeButton = document.getElementById("close-button");
const modalOkButton = document.getElementById("modal-ok-button");

// Variables de juego
let gameOver = false;
let foodX, foodY;
let snakeX = 8, snakeY = 8;
let snakeBody = [];
let velocityX = 0, velocityY = 0;
let setIntervalId;
let score = 0;
let highScores = JSON.parse(localStorage.getItem("high-scores")) || [];
const MAX_SCORES = 10;

// Funciones de sonido
const playSound = (sound) => {
    sound.currentTime = 0;
    sound.play();
};

// Funciones del modal
const showModal = (message) => {
    modalMessage.textContent = message;
    modal.style.display = "block";
};

const closeModal = () => {
    modal.style.display = "none";
};

closeButton.onclick = closeModal;
modalOkButton.onclick = closeModal;

window.onclick = (event) => {
    if (event.target == modal) closeModal();
};

// Funciones de juego
const changeFoodPosition = () => {
    do {
        foodX = Math.floor(Math.random() * 25) + 1;
        foodY = Math.floor(Math.random() * 25) + 1;
    } while (snakeBody.some(segment => segment[0] === foodX && segment[1] === foodY));
};

const handleGameOver = () => {
    clearInterval(setIntervalId);
    playSound(sonidos.fin);
    showModal("Fin del Juego!");
    saveScore(score);
    usuarioActualElement.style.display = "none";
    tablaClasificacion.style.display = "block";
    selectorTematicaDiv.style.display = "block";
    resetGame();
};

const resetGame = () => {
    gameOver = false;
    snakeX = 8;
    snakeY = 8;
    snakeBody = [];
    velocityX = 0;
    velocityY = 0;
    score = 0;
    scoreElement.innerHTML = `Puntos: ${score}`;
    playBoard.innerHTML = "";
    contenedorJuego.style.display = "none";
    botonComenzar.style.display = "inline-block";
    nombreUsuarioElement.style.display = "inline-block";
};

const changeDirection = (e) => {
    const directions = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
    };

    if (directions[e.key] && (velocityX !== -directions[e.key].x || velocityY !== -directions[e.key].y)) {
        velocityX = directions[e.key].x;
        velocityY = directions[e.key].y;
        playSound(sonidos.mover);
    }
};

const startGame = () => {
    if (gameOver) return handleGameOver();
    let htmlMarkup = `<div class="comida" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if (snakeX === foodX && snakeY === foodY) {
        changeFoodPosition();
        snakeBody.push([foodX, foodY]);
        score++;
        playSound(sonidos.comer);
        scoreElement.innerHTML = `Puntos: ${score}`;
    }

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }

    snakeBody[0] = [snakeX, snakeY];
    snakeX += velocityX;
    snakeY += velocityY;

    if (snakeX <= 0 || snakeX > 25 || snakeY <= 0 || snakeY > 25 || snakeBody.some((segment, idx) => idx !== 0 && segment[0] === snakeX && segment[1] === snakeY)) {
        gameOver = true;
    }

    snakeBody.forEach(segment => {
        htmlMarkup += `<div class="serpiente" style="grid-area: ${segment[1]} / ${segment[0]}"></div>`;
    });

    playBoard.innerHTML = htmlMarkup;
};

const saveScore = (score) => {
    const nombreUsuario = nombreUsuarioElement.value || "Anónimo";
    const newScore = { nombre: nombreUsuario, score: score };
    highScores = [...highScores, newScore].sort((a, b) => b.score - a.score).slice(0, MAX_SCORES);
    localStorage.setItem("high-scores", JSON.stringify(highScores));
    displayScores();
};

const displayScores = () => {
    listaPuntuaciones.innerHTML = highScores.map((score, index) =>
        `<li>${score.nombre} - Puntaje ${index + 1}: ${score.score}</li>`
    ).join('');
};

displayScores();

botonComenzar.addEventListener("click", () => {
    if (!nombreUsuarioElement.value.trim()) {
        showModal("Por favor, ingresa tu nombre.");
        return;
    }
    contenedorJuego.style.display = "flex";
    botonComenzar.style.display = "none";
    nombreUsuarioElement.style.display = "none";
    tablaClasificacion.style.display = "none";
    selectorTematicaDiv.style.display = "none";
    usuarioActualElement.innerHTML = `Jugador: ${nombreUsuarioElement.value}`;
    document.body.appendChild(usuarioActualElement);
    changeFoodPosition();
    setIntervalId = setInterval(startGame, 140);
});

const changeTheme = () => {
    const theme = selectorTematica.value;
    document.body.className = theme;
    contenedorJuego.className = `contenedor-juego ${theme}`;
    playBoard.className = `play-board ${theme}`;
};

selectorTematica.addEventListener("change", changeTheme);
document.addEventListener("keydown", changeDirection);

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}, false);

document.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].screenX;
    const touchEndY = event.changedTouches[0].screenY;
    handleGesture(touchStartX, touchStartY, touchEndX, touchEndY);
}, false);

window.addEventListener('load', () => {
    changeDirection({ key: "ArrowRight" });
}, false);

const handleGesture = (startX, startY, endX, endY) => {
    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            changeDirection({ key: "ArrowRight" });
        } else {
            changeDirection({ key: "ArrowLeft" });
        }
    } else {
        if (diffY > 0) {
            changeDirection({ key: "ArrowDown" });
        } else {
            changeDirection({ key: "ArrowUp" });
        }
    }
};
