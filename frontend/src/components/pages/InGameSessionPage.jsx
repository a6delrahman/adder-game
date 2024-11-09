import React, { useState, useEffect } from 'react';
import './InGameSessionPage.css';
import GameCanvas from "./GameCanvas";

// const ws = new WebSocket('ws://localhost:5000'); // WebSocket-Verbindung

const InGameSessionPage = () => {
    // const [snakePosition, setSnakePosition] = useState({ x: 5, y: 5 }); // Initiale Position
    // const [otherPlayers, setOtherPlayers] = useState([]); // Andere Spielerpositionen
    // const [targetNumber, setTargetNumber] = useState(generateRandomNumber());

    function generateRandomNumber() {
        return Math.floor(Math.random() * 100);
    }
    //
    // // Funktion zum Senden der Richtung
    // const sendDirectionUpdate = (direction) => {
    //     const message = JSON.stringify({ type: 'change_direction', direction });
    //     ws.send(message);
    // };
    //
    // // WebSocket-Verbindung und Nachrichtenempfang
    // useEffect(() => {
    //     ws.onopen = () => console.log("Connected to WebSocket server");
    //
    //     // Nachricht vom Server empfangen und Spielerpositionen aktualisieren
    //     ws.onmessage = (event) => {
    //         const data = JSON.parse(event.data);
    //         console.log('Received message:', data);
    //         if (data.type === 'update_position' && Array.isArray(data.players)) {
    //             const currentPlayer = data.players.find(player => player.id === 0); // Beispiel: Spieler-ID 0 ist der aktuelle
    //             if (currentPlayer) {
    //                 setSnakePosition(currentPlayer.position);
    //             }
    //             setOtherPlayers(data.players.filter(player => player.id !== 0));
    //         }
    //     };
    //
    //     // Tastendruck-Handler für die Richtung
    //     const handleKeyDown = (e) => {
    //         if (e.key === 'ArrowUp') sendDirectionUpdate('up');
    //         if (e.key === 'ArrowDown') sendDirectionUpdate('down');
    //         if (e.key === 'ArrowLeft') sendDirectionUpdate('left');
    //         if (e.key === 'ArrowRight') sendDirectionUpdate('right');
    //     };
    //
    //     window.addEventListener('keydown', handleKeyDown);
    //
    //     // Event-Listener beim Verlassen entfernen
    //     return () => window.removeEventListener('keydown', handleKeyDown);
    // }, []);

    return (
        <GameCanvas/>
        // <div className="in-game-session">
        //     <h1>Collect the Target: {targetNumber}</h1>
        //     <div className="game-area">
        //         {/* Andere Spieler anzeigen */}
        //         {otherPlayers.map((player, index) => (
        //             <div
        //                 key={index}
        //                 className="snake other-player"
        //                 style={{
        //                     top: player.position.y * 20,
        //                     left: player.position.x * 20
        //                 }}
        //             >
        //                 🐍
        //             </div>
        //         ))}
        //     </div>
        // </div>
    );
};

export default InGameSessionPage;
