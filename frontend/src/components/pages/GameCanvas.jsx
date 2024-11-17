import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useWebSocket } from '../../context/WebSocketContext';
import Snake from '../../classes/Snake';

const GameCanvas = ({ sessionId }) => {
    const canvasRef = useRef(null); // Canvas-Referenz
    const playerSnakeRef = useRef(null); // Referenz für die eigene Schlange
    const otherSnakesRef = useRef({}); // Referenz für andere Schlangen
    const boost = useRef(false); // Boost-Status
    const { playerSnake, otherSnakes, sendMessage } = useWebSocket(); // Zugriff auf den zentralisierten Zustand

    // Sendet die Bewegung an den Server
    const sendMovementData = (mouseX, mouseY) => {
        if (!playerSnake || !playerSnake.snakeId) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const targetX = mouseX - rect.left;
        const targetY = mouseY - rect.top;

        sendMessage({
            type: 'change_direction',
            snakeId: playerSnake.snakeId,
            targetX,
            targetY,
            boost: boost.current,
        });
    };

    // Zeichnet den Hintergrund des Canvas
    const drawBackground = (ctx) => {
        ctx.fillStyle = '#f0f0f0';
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
    };

    // Zeichnet alle Schlangen auf das Canvas
    const renderSnakes = (ctx) => {
        // Eigene Schlange
        if (playerSnake) {
            if (!playerSnakeRef.current) {
                // Initialisiere eigene Schlange
                playerSnakeRef.current = new Snake(
                    playerSnake.headPosition.x,
                    playerSnake.headPosition.y,
                    { color: 'green', scale: 0.8 }
                );
            }
            playerSnakeRef.current.updatePosition(playerSnake.segments);
            playerSnakeRef.current.draw(ctx);
        }

        // Andere Schlangen
        Object.entries(otherSnakes).forEach(([snakeId, snakeData]) => {
            if (!otherSnakesRef.current[snakeId]) {
                // Initialisiere gegnerische Schlange
                otherSnakesRef.current[snakeId] = new Snake(
                    snakeData.headPosition.x,
                    snakeData.headPosition.y,
                    { color: 'red', scale: 0.8 }
                );
            }
            otherSnakesRef.current[snakeId].updatePosition(snakeData.segments);
            otherSnakesRef.current[snakeId].draw(ctx);
        });
    };

    // Haupt-Rendering-Schleife
    const render = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        drawBackground(ctx); // Hintergrund zeichnen
        renderSnakes(ctx); // Schlangen zeichnen

        requestAnimationFrame(render); // Nächsten Frame planen
    };

    // Starte das Rendering und füge Event-Listener hinzu
    useEffect(() => {
        render(); // Rendering starten

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

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [playerSnake]); // Aktualisiere Event-Listener, wenn sich `playerSnake` ändert

    return <canvas ref={canvasRef} width={800} height={600} />;
};

GameCanvas.propTypes = {
    sessionId: PropTypes.string.isRequired,
};

export default GameCanvas;
