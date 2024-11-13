import React, { useRef, useEffect, useState } from 'react';
import Snake from '../../classes/Snake'; // Importiere die Snake-Klasse

const ws = new WebSocket('ws://localhost:5000');

const GameCanvas = () => {
    const [userId, setUserId] = useState(null); // Speichert die eindeutige ID des Spielers
    const otherSnakes = useRef({}); // Speichert die Schlangen anderer Spieler
    const canvasRef = useRef(null); // Referenz auf das Canvas-Element
    const playerSnake = useRef(null); // Referenz auf die eigene Snake-Instanz
    const boost = useRef(false); // Speichert den aktuellen Boost-Status

    // Sendet die Zielkoordinaten und Geschwindigkeit an den Server
    const sendMovementData = (mouseX, mouseY) => {
        if (userId) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const targetX = mouseX - rect.left;
            const targetY = mouseY - rect.top;

            ws.send(JSON.stringify({ type: 'change_direction', targetX, targetY, boost: boost.current }));
        }
    };


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ws.onopen = () => console.log("Connected to WebSocket server");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received message GameCanvas:', data);

            if (data.type === 'user_id') {
                // Speichert die zugewiesene User-ID im State
                setUserId(data.userId);
            }

            if (data.type === 'update_position' && Array.isArray(data.players)) {

                data.players.forEach(player => {
                    if (player.id === userId) {
                        // Spieler-Schlange erstellen oder aktualisieren
                        if (!playerSnake.current) {
                            playerSnake.current = new Snake(player.headPosition.x, player.headPosition.y, {
                                color: 'green',
                                scale: 0.8,
                            });
                        }
                        playerSnake.current.updatePosition(player.segments);
                    } else {
                        if (!otherSnakes.current[player.id]) {
                            otherSnakes.current[player.id] = new Snake(
                                player.headPosition.x,
                                player.headPosition.y,
                                { color: 'red', scale: 0.8 }
                            );
                        }
                        otherSnakes.current[player.id].updatePosition(player.segments);
                    }
                });
            }

            if (data.type === 'remove_player') {
                delete otherSnakes.current[data.userId];
            }
        };

        // Hintergrundraster zeichnen
        const drawBackground = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#ccc';
            const gridSize = 30;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        };

        // Haupt-Rendering-Schleife
        const render = () => {
            drawBackground();

            // Zeichne die eigene Schlange (vom Server empfangene Positionen)
            if (playerSnake.current) {
                playerSnake.current.draw(ctx);
            }

            Object.values(otherSnakes.current).forEach(snake => {
                snake.draw(ctx);
            });

            requestAnimationFrame(render);
        };

        render();

        // Mausbewegung und Klicks erfassen
        const handleMouseMove = (e) => {
            sendMovementData(e.clientX, e.clientY);
        };

        const handleMouseDown = (e) => {
            if (e.button === 0) { // Linke Maustaste
                boost.current = true;
            }
        };

        const handleMouseUp = (e) => {
            if (e.button === 0) { // Linke Maustaste
                boost.current = false;
            }
        };

        // Event-Listener für Mausbewegung und Mausklicks hinzufügen
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };

    }, [userId]);

    return <canvas ref={canvasRef} width={800} height={600} />;
};

export default GameCanvas;
