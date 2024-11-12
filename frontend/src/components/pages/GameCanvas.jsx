import React, { useRef, useEffect, useState } from 'react';
import Snake from '../../classes/Snake'; // Importiere die Snake-Klasse

const ws = new WebSocket('ws://localhost:5000');

const GameCanvas = () => {
    const [userId, setUserId] = useState(null); // Speichert die eindeutige ID des Spielers
    const [otherSnakes, setOtherSnakes] = useState({}); // Speichert die Schlangen anderer Spieler
    const canvasRef = useRef(null); // Referenz auf das Canvas-Element
    const playerSnake = useRef(null); // Referenz auf die eigene Snake-Instanz

    // Sendet eine Richtungsänderung an den Server
    const sendDirectionUpdate = (direction) => {
        if (userId) {
            const message = JSON.stringify({ type: 'change_direction', direction });
            ws.send(message);
        }
    };

    // Tastatur-Handler für die Bewegung der Schlange
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') sendDirectionUpdate('up');
        if (e.key === 'ArrowDown') sendDirectionUpdate('down');
        if (e.key === 'ArrowLeft') sendDirectionUpdate('left');
        if (e.key === 'ArrowRight') sendDirectionUpdate('right');
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ws.onopen = () => console.log("Connected to WebSocket server");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received message GameCanvas:', data);
            // console.log('Othersnakes:', otherSnakes);

            if (data.type === 'user_id') {
                // Speichert die zugewiesene User-ID im State
                setUserId(data.userId);
            }

            if (data.type === 'update_position' && Array.isArray(data.players)) {
                // Neuer Zustand für otherSnakes initialisieren
                const updatedOtherSnakes = otherSnakes;

                data.players.forEach(player => {
                    if (player.id === userId) {
                        // Spieler-Schlange erstellen oder aktualisieren
                        if (!playerSnake.current) {
                            playerSnake.current = new Snake(player.headPosition.x, player.headPosition.y, {
                                color: 'green',
                                scale: 0.8,
                            });
                        }
                        // Aktualisiere die Segmente der Schlange anhand der Server-Daten
                        playerSnake.current.sections = player.segments;
                    } else {
                        // Erstellen einer neuen Snake-Instanz für andere Spieler, falls noch nicht vorhanden
                        if (!otherSnakes[player.id]) {
                            updatedOtherSnakes[player.id] = new Snake(
                                player.headPosition.x,
                                player.headPosition.y,
                                { color: 'red', scale: 0.8 }
                            );
                        } else {
                            // Verwende die bestehende Snake-Instanz für diesen Spieler
                            updatedOtherSnakes[player.id] = otherSnakes[player.id];
                        }

                        // Aktualisiere die Segmente der anderen Schlange
                        updatedOtherSnakes[player.id].sections = player.segments;
                    }
                });

                // Zustand setzen, um Rendering zu triggern
                setOtherSnakes(updatedOtherSnakes);
            }

            // Reagiere auf die Nachricht zum Entfernen eines Spielers
            if (data.type === 'remove_player') {
                const newOtherSnakes = otherSnakes;
                delete newOtherSnakes[data.userId]; // Entferne die Schlange des Spielers, der getrennt wurde
                setOtherSnakes(newOtherSnakes);
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

            // Zeichne die Schlangen der anderen Spieler
            Object.values(otherSnakes).forEach(snake => {
                snake.draw(ctx);
            });

            requestAnimationFrame(render);
        };

        render();

        // Tastatur-Event-Listener hinzufügen
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            // Entferne Tastatur-Event-Listener beim Verlassen der Komponente
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [userId]);

    return <canvas ref={canvasRef} width={800} height={600} />;
};

export default GameCanvas;
