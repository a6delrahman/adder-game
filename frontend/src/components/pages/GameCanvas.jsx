import React, { useRef, useEffect, useState } from 'react';
import Snake from '../../classes/Snake'; // Importiere die Snake-Klasse

const ws = new WebSocket('ws://localhost:5000'); // WebSocket-Verbindung

const GameCanvas = () => {
    const [userId, setUserId] = useState(null); // User-ID des Clients
    const [otherSnakes, setOtherSnakes] = useState({}); // Positionen der anderen Spieler
    const canvasRef = useRef(null);
    const playerSnake = useRef(null); // Snake-Instanz für den eigenen Spieler

    const sendDirectionUpdate = (direction) => {
        if (userId) {
            const message = JSON.stringify({ type: 'change_direction', direction });
            ws.send(message);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') sendDirectionUpdate('up');
        if (e.key === 'ArrowDown') sendDirectionUpdate('down');
        if (e.key === 'ArrowLeft') sendDirectionUpdate('left');
        if (e.key === 'ArrowRight') sendDirectionUpdate('right');
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Eigene Schlange initialisieren
        playerSnake.current = new Snake(400, 300, { color: 'green', speed: 2, scale: 0.8 });

        ws.onopen = () => console.log("Connected to WebSocket server");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received message GameCanvas:', data);

            if (data.type === 'user_id') {
                setUserId(data.userId);
                console.log("Assigned User ID:", data.userId);
            }

            if (data.type === 'update_position' && Array.isArray(data.players)) {
                data.players.forEach(player => {
                    if (player.id === userId) {
                        // Position des eigenen Spielers aktualisieren
                        playerSnake.current.position = player.position;
                    } else {
                        // Andere Spieler-Schlangen aktualisieren oder hinzufügen
                        setOtherSnakes(prevOtherSnakes => {
                            const newOtherSnakes = { ...prevOtherSnakes };
                            if (!newOtherSnakes[player.id]) {
                                // Neue Schlange für diesen Spieler erstellen
                                newOtherSnakes[player.id] = new Snake(
                                    player.position.x,
                                    player.position.y,
                                    { color: 'red', speed: 2, scale: 0.8 }
                                );
                            }
                            // Position der bestehenden Schlange aktualisieren
                            newOtherSnakes[player.id].position = player.position;
                            return newOtherSnakes;
                        });
                    }
                });
            }
        };

        const drawBackground = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Zeichne Raster
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

        const render = () => {
            drawBackground();

            // Eigene Schlange aktualisieren und zeichnen
            playerSnake.current.update();
            playerSnake.current.draw(ctx);

            // Andere Schlangen aktualisieren und zeichnen
            Object.values(otherSnakes).forEach(snake => {
                snake.update();
                snake.draw(ctx);
            });

            requestAnimationFrame(render);
        };

        render();

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [userId, otherSnakes]); // Abhängigkeiten aktualisiert

    return <canvas ref={canvasRef} width={800} height={600} />;
};

export default GameCanvas;
