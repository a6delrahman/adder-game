// GameSessionPage.jsx
import React, {useEffect, useRef, useState} from 'react';
import GameTypeSelectionPage from './GameTypeSelectionPage';
import GameCanvas from './GameCanvas.jsx'; // Spielseite, die die Spielsession anzeigt
import {useNavigate} from 'react-router-dom';

const GameSessionPage = () => {
    const [sessionId, setSessionId] = useState(null);
    const [wsRef, setWsRef] = useState(null); // Referenz für WebSocket, damit es session-spezifisch ist
    const [snakeId, setSnakeId] = useState(null); // Speichert die eindeutige ID des Spielers
    const navigate = useNavigate();

    // Funktion, die beim erfolgreichen Beitritt zu einer Sitzung ausgeführt wird
    const handleSessionJoin = (id) => {
        setSessionId(id); // Speichert die Sitzungs-ID
        navigate(`/session/${id}`); // Navigiert zur Session-Seite
    };


    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:5000`);
        setWsRef(ws);

        ws.onopen = () => console.log("Connected to WebSocket server!");

        ws.onclose = () => {
            // ws.send(JSON.stringify({ type: 'leave_session' }));
            console.log("Disconnected from WebSocket server!");
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received message GameCanvas:', data);

            if (data.type === 'connect') {
                // Speichert die zugewiesene Snake-ID im State
                console.log('Received clientId:', data.clientId);
            }

            if (data.type === 'session_joined') {
                // Speichert die zugewiesene sessionId im State
                console.log('Received session_ID:', data.sessionId);
                handleSessionJoin(data.sessionId);
            }

            if (data.type === 'snake_id') {
                // Speichert die zugewiesene Snake-ID im State
                console.log('Received snakeId:', data.snakeId);
                setSnakeId(data.snakeId);
            }
            //
            //     if (data.type === 'update_position' && Array.isArray(data.players)) {
            //
            //         data.players.forEach(player => {
            //             if (player.snakeId === snakeId.current) {
            //                 // Spieler-Schlange erstellen oder aktualisieren
            //                 if (!playerSnake.current) {
            //                     playerSnake.current = new Snake(player.headPosition.x, player.headPosition.y, {
            //                         color: 'green',
            //                         scale: 0.8,
            //                     });
            //                 }
            //                 playerSnake.current.updatePosition(player.segments);
            //             } else {
            //                 if (!otherSnakes.current[player.snakeId]) {
            //                     otherSnakes.current[player.snakeId] = new Snake(
            //                         player.headPosition.x,
            //                         player.headPosition.y,
            //                         { color: 'red', scale: 0.8 }
            //                     );
            //                 }
            //                 otherSnakes.current[player.snakeId].updatePosition(player.segments);
            //             }
            //         });
            //     }
            //
            //     if (data.type === 'remove_player') {
            //         delete otherSnakes.current[data.snakeId];
            //     }
        };

        // Trenne WebSocket-Verbindung beim Verlassen der Komponente oder Wechsel der Session
        return () => {
            // ws.send(JSON.stringify({ type: 'leave_session' }));
            // ws.close();
            // wsRef.current = null;
        };
    }, []);


    return (
        <div>
            {sessionId ? (
                <GameCanvas snakeId={snakeId} ws={wsRef} sessionId={sessionId}/> // Spielseite anzeigen, wenn Sitzung beigetreten wurde
            ) : (
                <GameTypeSelectionPage ws={wsRef} onSessionJoin={handleSessionJoin}/>
            )}
        </div>
    );
};

export default GameSessionPage;
