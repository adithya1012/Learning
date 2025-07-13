import React, { useRef, useEffect, useState } from 'react';
import './Game.css';

const Game = () => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('playing'); // playing, won, lost
    const [score, setScore] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let paddle = {
            x: canvas.width / 2 - 50,
            y: canvas.height - 20,
            width: 100,
            height: 10,
            color: '#0095DD',
            dx: 8
        };

        let balls = [];
        const ballCount = 3;
        const ballRadius = 10;

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
                const isRed = Math.random() < 0.2;
                bricks[c][r] = {
                    x: 0,
                    y: 0,
                    status: 1,
                    color: isRed ? '#D32F2F' : '#4CAF50'
                };
            }
        }

        function createBall() {
            return {
                x: canvas.width / 2,
                y: canvas.height / 2,
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

        const keyDownHandler = (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = true;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = true;
            }
        };

        const keyUpHandler = (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = false;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = false;
            }
        };

        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);

        const drawPaddle = () => {
            ctx.beginPath();
            ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
            ctx.fillStyle = paddle.color;
            ctx.fill();
            ctx.closePath();
        };

        const drawBalls = () => {
            balls.forEach(ball => {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            });
        };

        const drawBricks = () => {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r].status === 1) {
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
        };

        const movePaddle = () => {
            if (rightPressed && paddle.x < canvas.width - paddle.width) {
                paddle.x += paddle.dx;
            } else if (leftPressed && paddle.x > 0) {
                paddle.x -= paddle.dx;
            }
        };

        const collisionDetection = () => {
            balls.forEach(ball => {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 0; r < brickRowCount; r++) {
                        let b = bricks[c][r];
                        if (b.status === 1) {
                            if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                                ball.dy = -ball.dy;
                                if (b.color === '#4CAF50') {
                                    b.status = 0;
                                    setScore(prevScore => prevScore + 10);
                                }
                            }
                        }
                    }
                }
            });
        };

        const update = () => {
            if (gameState !== 'playing') return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBricks();
            drawPaddle();
            drawBalls();
            movePaddle();
            collisionDetection();

            balls.forEach((ball, index) => {
                ball.x += ball.dx * ball.speedMultiplier;
                ball.y += ball.dy * ball.speedMultiplier;

                if (ball.x + ballRadius > canvas.width || ball.x - ballRadius < 0) {
                    ball.dx = -ball.dx;
                }
                if (ball.y - ballRadius < 0) {
                    ball.dy = -ball.dy;
                }

                if (ball.y + ballRadius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                    ball.dy = -ball.dy;
                    ball.speedMultiplier *= 1.01;
                }

                if (ball.y + ballRadius > canvas.height) {
                    balls.splice(index, 1);
                }
            });

            let greenBricksLeft = 0;
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r].status === 1 && bricks[c][r].color === '#4CAF50') {
                        greenBricksLeft++;
                    }
                }
            }

            if (greenBricksLeft === 0) {
                setGameState('won');
            }

            if (balls.length === 0) {
                setGameState('lost');
            }

            balls.forEach(ball => {
                ball.speedMultiplier += 0.0001;
            });

            animationFrameId = requestAnimationFrame(update);
        };

        update();

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('keydown', keyDownHandler);
            document.removeEventListener('keyup', keyUpHandler);
        };
    }, [gameState]);

    const restartGame = () => {
        setGameState('playing');
        setScore(0);
    };

    return (
        <div className="game-container">
            <h1>Brick Breaker</h1>
            <canvas ref={canvasRef} width="800" height="600" />
            <div className="info">
                <p>Score: {score}</p>
            </div>
            {gameState === 'won' && (
                <div className="game-over">
                    <h2>You Win!</h2>
                    <button onClick={restartGame}>Play Again</button>
                </div>
            )}
            {gameState === 'lost' && (
                <div className="game-over">
                    <h2>Game Over</h2>
                    <button onClick={restartGame}>Try Again</button>
                </div>
            )}
        </div>
    );
};

export default Game;