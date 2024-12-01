import React, { useEffect, useRef } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import Snake from '../../classes/Snake';

const GameCanvas = () => {
    const canvasRef = useRef(null); // Canvas-Referenz
    const playerSnakeRef = useRef(null); // Referenz für die eigene Schlange
    const otherSnakesRef = useRef([]); // Referenz für andere Schlangen
    const boost = useRef(false); // Boost-Status
    const {playerSnake, otherSnakes, sendMessage, boundaries, food} = useWebSocket(); // Zugriff auf den zentralisierten Zustand
    const backgroundImageRef = useRef(null); // Referenz für das Hintergrundbild


    // Sendet die Bewegung an den Server
    const sendMovementData = (mouseX, mouseY) => {
        if (!playerSnake?.current.snakeId) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const targetX = mouseX - rect.left;
        const targetY = mouseY - rect.top;

        // playerSnakeRef.current.updatePositionLocal(targetX, targetY);
        // playerSnakeRef.current.movePlayer(targetX, targetY);
        playerSnakeRef.current.updateDirection(targetX, targetY);
        sendMessage({
            type: 'change_direction',
            snakeId: playerSnake.snakeId,
            targetX,
            targetY,
            boost: boost.current,
        });
    };

    // Bild vorab laden
    useEffect(() => {
        const image = new Image();
        image.src = '/src/assets/cosmos.jpg' // Bild-URL
        backgroundImageRef.current = image;
    }, []);

    // Zeichnet das Hintergrundbild
    const drawBackground = (ctx) => {
        const image = backgroundImageRef.current;
        if (image?.complete) { // Prüfen, ob das Bild geladen ist
            ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
        } else {
            ctx.fillStyle = '#f0f0f0'; // Fallback-Hintergrundfarbe
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.strokeStyle = '#ccc';
            const gridSize = 30;
            for (let x = 0; x < ctx.canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, ctx.canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < ctx.canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(ctx.canvas.width, y);
                ctx.stroke();
            }
        }
    };



    // Zeichnet alle Schlangen auf das Canvas
    const renderSnakes = (ctx) => {
        otherSnakes.current.forEach(player => {
            if (player.snakeId === playerSnake.current.snakeId) {
                // Spieler-Schlange erstellen oder aktualisieren
                if (!playerSnakeRef.current) {
                    playerSnakeRef.current = new Snake(player.headPosition.x, player.headPosition.y, {
                        color: 'green',
                        scale: 0.8,
                    });
                }
                // playerSnakeRef.current.updatePosition(player.segments);
                playerSnakeRef.current.draw(ctx);
            } else {
                if (!otherSnakesRef.current[player.snakeId]) {
                    otherSnakesRef.current[player.snakeId] = new Snake(
                        player.headPosition.x,
                        player.headPosition.y,
                        { color: 'red', scale: 0.6, }
                    );
                }
                // otherSnakesRef.current[player.snakeId].updatePosition(player.segments);
                // otherSnakesRef.current[player.snakeId].draw(ctx);
            }
        });
    };

    const renderScores = (ctx) => {
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        let yPosition = 20;

        otherSnakes.current.forEach((snake) => {
            ctx.fillText(`Player ${snake.snakeId}: ${snake.score || 0} points`, 10, yPosition);
            yPosition += 20;
        });
    };

    const renderMathEquations = (ctx, equation) => {
        if (!equation) return; // Wenn keine Aufgabe vorhanden ist, nichts zeichnen

        ctx.font = '24px Arial'; // Schriftart und Größe
        ctx.fillStyle = '#fff'; // Textfarbe
        ctx.textAlign = 'center'; // Zentriere den Text horizontal
        ctx.fillText(equation, ctx.canvas.width / 2, 30); // Zeichne den Text (x = Mitte, y = 30px vom oberen Rand)
    };

    const renderFood = (ctx, food) => {
        if (!food.current) return;

        food.current.forEach((foodItem) => {
            // Zeichne das Food-Objekt als Kreis
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(foodItem.x, foodItem.y, 5, 0, Math.PI * 2);
            ctx.fill();

            // Wenn Metadaten vorhanden sind und ein Resultat enthalten, zeichne den Text
            if (foodItem.meta?.result !== undefined) {
                ctx.font = '14px Arial'; // Schriftart und -größe
                ctx.fillStyle = '#fff'; // Textfarbe
                ctx.textAlign = 'center'; // Zentriere den Text horizontal
                ctx.fillText(foodItem.meta.result, foodItem.x, foodItem.y - 10); // Zeichne das Resultat 10px über dem Kreis
            }
        });
    };



    // Haupt-Rendering-Schleife
    const render = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawBackground(ctx); // Hintergrund zeichnen
        renderSnakes(ctx); // Schlangen zeichnen
        renderScores(ctx); // Punktzahlen zeichnen
        renderFood(ctx, food); // Essen zeichnen

        if (playerSnake.current?.currentEquation) {
            renderMathEquations(ctx, playerSnake.current.currentEquation.equation); // Aufgabe zeichnen
        }

        requestAnimationFrame(render); // Nächsten Frame planen
    };

    setInterval(() => {
        if (playerSnakeRef.current) {
            playerSnakeRef.current.movePlayer();
        }
    }   , 50);

    // Starte das Rendering und füge Event-Listener hinzu
    useEffect(() => {

        const handleMouseMove = (e) => sendMovementData(e.clientX, e.clientY);
        const handleMouseDown = (e) => {
            if (e.button === 0) {
                boost.current = true;
                sendMovementData(e.clientX, e.clientY);
            }
        };
        const handleMouseUp = (e) => {
            if (e.button === 0) {
                boost.current = false;
                sendMovementData(e.clientX, e.clientY);
            }
        };

        const canvas = canvasRef.current;
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);

        // Trenne WebSocket-Verbindung beim Verlassen der Komponente oder Wechsel der Session
        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [playerSnake]); // Aktualisiere Event-Listener, wenn sich `playerSnake` ändert


    useEffect(() => {
        let animationFrameId; // Speichert die ID des aktuellen Frames

        const renderLoop = (timestamp) => {
            render(); // Starte das Zeichnen
            animationFrameId = requestAnimationFrame(renderLoop); // Plan den nächsten Frame
        };

        renderLoop(); // Starte die Schleife

        return () => cancelAnimationFrame(animationFrameId); // Stoppe die Schleife beim Unmount
    }, []);


    return <canvas ref={canvasRef} width={800} height={600} />;
};

export default GameCanvas;
