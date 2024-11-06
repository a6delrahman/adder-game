import React, { useState, useEffect } from 'react';
import './InGameSessionPage.css';

const ws = new WebSocket('ws://localhost:5000'); // Verbindung zum WebSocket-Server herstellen

const InGameSessionPage = () => {
    const [snakePosition, setSnakePosition] = useState({ x: 5, y: 5 }); // Startposition des Spielers
    const [otherPlayers, setOtherPlayers] = useState([]); // Standardwert ist ein leeres Array
    const [targetNumber, setTargetNumber] = useState(generateRandomNumber());

    // Zufallszahl für das Spielziel generieren
    function generateRandomNumber() {
        return Math.floor(Math.random() * 100);
    }

    // Funktion zur Berechnung der neuen Position der Schlange
    const getNewPosition = (prev, direction) => {
        switch (direction) {
            case 'up': return { x: prev.x, y: prev.y - 1 };
            case 'down': return { x: prev.x, y: prev.y + 1 };
            case 'left': return { x: prev.x - 1, y: prev.y };
            case 'right': return { x: prev.x + 1, y: prev.y };
            default: return prev;
        }
    };

    // Bewegung der Schlange basierend auf Tastendruck und Position senden
    const moveSnake = (direction) => {
        setSnakePosition(prev => {
            const newPos = getNewPosition(prev, direction);
            sendPositionUpdate(newPos);
            return newPos;
        });
    };

    // WebSocket-Nachricht mit der neuen Position senden
    const sendPositionUpdate = (newPosition) => {
        const message = JSON.stringify({ type: 'update_position', position: newPosition });
        ws.send(message);
    };

    // WebSocket-Verbindung und Nachrichtenempfang einrichten
    useEffect(() => {
        ws.onopen = () => console.log("Connected to WebSocket server");

        // Nachricht vom Server empfangen und Spielerpositionen aktualisieren
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Überprüfen, ob die empfangene Nachricht das `players`-Array enthält
            if (data.type === 'update_position' && Array.isArray(data.players)) {
                setOtherPlayers(data.players); // Aktualisiere `otherPlayers` nur, wenn es ein Array ist
            }
        };

        // Tastendruck-Handler für die Bewegung
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp') moveSnake('up');
            if (e.key === 'ArrowDown') moveSnake('down');
            if (e.key === 'ArrowLeft') moveSnake('left');
            if (e.key === 'ArrowRight') moveSnake('right');
        };

        window.addEventListener('keydown', handleKeyDown);

        // Event-Listener beim Verlassen entfernen
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="in-game-session">
            <h1>Collect the Target: {targetNumber}</h1>
            <div className="game-area">
                {/* Spieler-Schlange anzeigen */}
                <div
                    className="snake"
                    style={{
                        top: snakePosition.y * 20,
                        left: snakePosition.x * 20
                    }}
                >
                    🐍
                </div>

                {/* Andere Spieler anzeigen */}
                {otherPlayers.map((player, index) => (
                    <div
                        key={index}
                        className="snake other-player"
                        style={{
                            top: player.position.y * 20,
                            left: player.position.x * 20
                        }}
                    >
                        🐍
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InGameSessionPage;
