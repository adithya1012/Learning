const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 20,
    width: 100,
    height: 10,
    color: '#0095DD',
    dx: 8
};

let balls = [];
const ballCount = 5;
const ballRadius = 10;

// Brick variables
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        const isRed = Math.random() < 0.2; // 20% chance of being a red brick
        bricks[c][r] = {
            x: 0,
            y: 0,
            status: 1,
            color: isRed ? 'red' : 'green'
        };
    }
}

function createBall() {
    return {
        x: Math.random() * (canvas.width - 2 * ballRadius) + ballRadius,
        y: Math.random() * (canvas.height / 2) + ballRadius + brickRowCount * (brickHeight + brickPadding), // Start below bricks
        dx: (Math.random() - 0.5) * 4,
        dy: Math.random() * 2 + 2,
        speedMultiplier: 1.0
    };
}

for (let i = 0; i < ballCount; i++) {
    balls.push(createBall());
}

let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if (e.key == 'Right' || e.key == 'ArrowRight') {
        rightPressed = true;
    } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == 'Right' || e.key == 'ArrowRight') {
        rightPressed = false;
    } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
        leftPressed = false;
    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

function drawBalls() {
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    });
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function movePaddle() {
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.dx;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

function collisionDetection() {
    balls.forEach(ball => {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                let b = bricks[c][r];
                if (b.status == 1) {
                    if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                        ball.dy = -ball.dy;
                        if (b.color === 'green') {
                            b.status = 0;
                        }
                    }
                }
            }
        }
    });
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBalls();
    movePaddle();
    collisionDetection();

    balls.forEach((ball, index) => {
        ball.x += ball.dx * ball.speedMultiplier;
        ball.y += ball.dy * ball.speedMultiplier;

        // Wall collision (top, left, right)
        if (ball.x + ballRadius > canvas.width || ball.x - ballRadius < 0) {
            ball.dx = -ball.dx;
        }
        if (ball.y - ballRadius < 0) {
            ball.dy = -ball.dy;
        }

        // Paddle collision
        if (ball.y + ballRadius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
            ball.speedMultiplier *= 1.01; // Increase speed
        }

        // Bottom wall collision
        if (ball.y + ballRadius > canvas.height) {
            balls.splice(index, 1);
        }
    });

    let greenBricksLeft = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1 && bricks[c][r].color === 'green') {
                greenBricksLeft++;
            }
        }
    }

    if (greenBricksLeft === 0) {
        win();
        return;
    }

    if (balls.length === 0) {
        gameOver();
        return;
    }

    // Increase speed over time
    balls.forEach(ball => {
        ball.speedMultiplier += 0.0001;
    });

    requestAnimationFrame(update);
}

function gameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '48px serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);

    ctx.font = '24px serif';
    ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 50);

    canvas.addEventListener('click', () => {
        document.location.reload();
    }, {
        once: true
    });
}

function win() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '48px serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);

    ctx.font = '24px serif';
    ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 50);

    canvas.addEventListener('click', () => {
        document.location.reload();
    }, {
        once: true
    });
}

update();