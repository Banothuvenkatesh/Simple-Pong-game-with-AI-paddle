const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 16;
const paddleHeight = 100;
const paddleMargin = 20;
const ballSize = 16;
const playerColor = '#00FFB2';
const aiColor = '#FF6B00';
const ballColor = '#FFD700';

let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;
let playerScore = 0;
let aiScore = 0;

// Ball object
const ball = {
    x: canvas.width / 2 - ballSize / 2,
    y: canvas.height / 2 - ballSize / 2,
    vx: Math.random() < 0.5 ? 5 : -5,
    vy: (Math.random() * 4 - 2),
    size: ballSize
};

function resetBall() {
    ball.x = canvas.width / 2 - ballSize / 2;
    ball.y = canvas.height / 2 - ballSize / 2;
    ball.vx = (Math.random() < 0.5 ? 5 : -5);
    ball.vy = (Math.random() * 4 - 2);
}

canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - paddleHeight / 2;
    // Clamp so paddle stays in canvas
    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, size = 32) {
    ctx.fillStyle = "#fff";
    ctx.font = `${size}px Arial`;
    ctx.fillText(text, x, y);
}

function draw() {
    // Background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center line
    ctx.setLineDash([8, 16]);
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    drawRect(paddleMargin, playerY, paddleWidth, paddleHeight, playerColor);
    drawRect(canvas.width - paddleMargin - paddleWidth, aiY, paddleWidth, paddleHeight, aiColor);

    // Draw ball
    drawCircle(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.size / 2, ballColor);

    // Draw scores
    drawText(playerScore, canvas.width / 2 - 60, 50, 40);
    drawText(aiScore, canvas.width / 2 + 30, 50, 40);
}

// Simple AI: follows the ball with some delay
function updateAI() {
    const aiCenter = aiY + paddleHeight / 2;
    const target = ball.y + ball.size / 2;
    if (aiCenter < target - 10) {
        aiY += 4;
    } else if (aiCenter > target + 10) {
        aiY -= 4;
    }
    aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));
}

function update() {
    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top and bottom collision
    if (ball.y <= 0) {
        ball.y = 0;
        ball.vy *= -1;
    }
    if (ball.y + ball.size >= canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.vy *= -1;
    }

    // Paddle collision (player)
    if (
        ball.x <= paddleMargin + paddleWidth &&
        ball.y + ball.size >= playerY &&
        ball.y <= playerY + paddleHeight
    ) {
        ball.x = paddleMargin + paddleWidth;
        ball.vx *= -1;
        // Add effect based on hit position
        let impact = (ball.y + ball.size / 2 - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
        ball.vy = impact * 5;
    }

    // Paddle collision (AI)
    if (
        ball.x + ball.size >= canvas.width - paddleMargin - paddleWidth &&
        ball.y + ball.size >= aiY &&
        ball.y <= aiY + paddleHeight
    ) {
        ball.x = canvas.width - paddleMargin - paddleWidth - ball.size;
        ball.vx *= -1;
        let impact = (ball.y + ball.size / 2 - (aiY + paddleHeight / 2)) / (paddleHeight / 2);
        ball.vy = impact * 5;
    }

    // Left/right wall: score
    if (ball.x < 0) {
        aiScore += 1;
        resetBall();
    }
    if (ball.x + ball.size > canvas.width) {
        playerScore += 1;
        resetBall();
    }

    updateAI();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();