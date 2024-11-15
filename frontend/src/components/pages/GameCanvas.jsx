import React, {useRef, useEffect, useState} from 'react';
import PropTypes from 'prop-types'; // Importiere PropTypes
import Snake from '../../classes/Snake'; // Importiere die Snake-Klasse

const GameCanvas = ({ sessionId }) => {
    const userId = useRef(null); // Speichert die eindeutige ID des Spielers
    const otherSnakes = useRef([]); // Speichert die Schlangen anderer Spieler
    const canvasRef = useRef(null); // Referenz auf das Canvas-Element
    const playerSnake = useRef(null); // Referenz auf die eigene Snake-Instanz
    const boost = useRef(false); // Speichert den aktuellen Boost-Status
    const wsRef = useRef(null); // Referenz für WebSocket, damit es session-spezifisch ist


    // Sendet die Zielkoordinaten und Geschwindigkeit an den Server
    const sendMovementData = (mouseX, mouseY) => {
        if (userId && wsRef.current) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const targetX = mouseX - rect.left;
            const targetY = mouseY - rect.top;

            wsRef.current.send(JSON.stringify({ type: 'change_direction', targetX, targetY, boost: boost.current }));
        }
    };


    useEffect(() => {
        if (!sessionId) return; // Nur fortfahren, wenn sessionId verfügbar ist

        // Initialisiere WebSocket nur, wenn sessionId vorhanden ist
        const ws = new WebSocket(`ws://localhost:5000/session/${sessionId}`);
        wsRef.current = ws;

        ws.onopen = () => console.log("Connected to WebSocket server for session:", sessionId);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received message GameCanvas:', data);

            //todo: Implementierung der Logik für die empfangenen Nachrichten
            if (data.type === 'user_id') {
                // Speichert die zugewiesene User-ID im State
                console.log('Received user_id:', data.userId);
                userId.current = data.userId;
            }

            if (data.type === 'update_position' && Array.isArray(data.players)) {

                data.players.forEach(player => {
                    if (player.userId === userId.current) {
                        // Spieler-Schlange erstellen oder aktualisieren
                        if (!playerSnake.current) {
                            playerSnake.current = new Snake(player.headPosition.x, player.headPosition.y, {
                                color: 'green',
                                scale: 0.8,
                            });
                        }
                        playerSnake.current.updatePosition(player.segments);
                    } else {
                        if (!otherSnakes.current[player.userId]) {
                            otherSnakes.current[player.userId] = new Snake(
                                player.headPosition.x,
                                player.headPosition.y,
                                { color: 'red', scale: 0.8 }
                            );
                        }
                        otherSnakes.current[player.userId].updatePosition(player.segments);
                    }
                });
            }

            if (data.type === 'remove_player') {
                delete otherSnakes.current[data.userId];
            }
        };

        // Trenne WebSocket-Verbindung beim Verlassen der Komponente oder Wechsel der Session
        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [sessionId]);

    // Hintergrund und Rendering
    const drawBackground = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
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
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
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

    useEffect(() => {
        render();

        // Event-Listener für Mausbewegung und Mausklicks hinzufügen
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

        // Event-Listener für Mausbewegung und Mausklicks hinzufügen
        canvasRef.current.addEventListener('mousemove', handleMouseMove);
        canvasRef.current.addEventListener('mousedown', handleMouseDown);
        canvasRef.current.addEventListener('mouseup', handleMouseUp);

        return () => {
            const canvas = canvasRef.current;
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };

    }, [userId.current, sessionId]);

    return <canvas ref={canvasRef} width={800} height={600} />;
};

// Füge Prop-Validierung hinzu
GameCanvas.propTypes = {
    sessionId: PropTypes.string.isRequired, // Erwarte eine Funktion als Prop
};

export default GameCanvas;
