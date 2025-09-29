const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_RADIUS = 10;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;

let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() * 2 - 1);

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#fff4";
    ctx.lineWidth = 4;
    for (let i = 0; i < canvas.height; i += 28) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i);
        ctx.lineTo(canvas.width / 2, i + 14);
        ctx.stroke();
    }
}

function render() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, "#111");
    // Net
    drawNet();
    // Paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#00dfd8");
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#ff005c");
    // Ball
    drawCircle(ballX, ballY, BALL_RADIUS, "#fff");
}

// Paddle collision
function paddleCollision(px, py) {
    return (
        ballX - BALL_RADIUS < px + PADDLE_WIDTH &&
        ballX + BALL_RADIUS > px &&
        ballY + BALL_RADIUS > py &&
        ballY - BALL_RADIUS < py + PADDLE_HEIGHT
    );
}

// Mouse control
canvas.addEventListener('mousemove', function (evt) {
    let rect = canvas.getBoundingClientRect();
    let root = document.documentElement;
    let mouseY = evt.clientY - rect.top - root.scrollTop;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - PADDLE_HEIGHT)
        playerY = canvas.height - PADDLE_HEIGHT;
});

// AI
function updateAI() {
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ballY - 15) {
        aiY += 5;
    } else if (aiCenter > ballY + 15) {
        aiY -= 5;
    }
    // Clamp
    if (aiY < 0) aiY = 0;
    if (aiY > canvas.height - PADDLE_HEIGHT)
        aiY = canvas.height - PADDLE_HEIGHT;
}

// Ball reset
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() * 2 - 1);
}

// Game loop
function update() {
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top and bottom wall collision
    if (ballY - BALL_RADIUS < 0 || ballY + BALL_RADIUS > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    // Left paddle collision
    if (
        paddleCollision(PLAYER_X, playerY) &&
        ballSpeedX < 0
    ) {
        ballSpeedX = -ballSpeedX;
        // Add some "spin"
        let collidePoint = ballY - (playerY + PADDLE_HEIGHT / 2);
        ballSpeedY = collidePoint * 0.2;
    }

    // Right paddle collision (AI)
    if (
        paddleCollision(AI_X, aiY) &&
        ballSpeedX > 0
    ) {
        ballSpeedX = -ballSpeedX;
        let collidePoint = ballY - (aiY + PADDLE_HEIGHT / 2);
        ballSpeedY = collidePoint * 0.2;
    }

    // Left/right wall (score)
    if (ballX - BALL_RADIUS < 0 || ballX + BALL_RADIUS > canvas.width) {
        resetBall();
    }

    // Update AI paddle
    updateAI();
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
