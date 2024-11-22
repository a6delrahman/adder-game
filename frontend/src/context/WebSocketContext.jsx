// WebSocketContext.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Snake from "../classes/Snake.js";


export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    console.log('WebSocketProvider rendered'); // Add this line for debugging
    // console.trace('Render Stack');  // Add this line for debugging

    const [isReady, setIsReady] = useState(false);
    const playerSnake = useRef(null); // Referenz auf die eigene Snake-Instanz
    const otherSnakes = useRef({}); // Speichert die Schlangen anderer Spieler
    const [isSessionActive, setIsSessionActive] = useState(false);
    const sessionId = useRef(null); // Neu: Speichert die aktuelle Session-ID
    const ws = useRef(null);
    const boundaries = useRef({ width: 0, height: 0 });
    const food = useRef([]);

    const messageHandlers = useRef({
        default: (data) => console.warn(`Unhandled message type: ${data.type}`, data),

        connect: (data) => {
            console.log('Connected, clientId:', data.clientId);
        },

        session_joined: (data) => {
            playerSnake.current = data.playerState; // Speichert die eigene Schlange
            sessionId.current = data.playerState.sessionId; // Speichert die Session-ID
            otherSnakes.current = data.initialGameState.players; // Speichert die Schlangen anderer Spieler
            food.current = data.initialGameState.food; // Speichert die Nahrung
            boundaries.current = data.initialGameState.boundaries; // Speichert die Spielfeldgrenzen

            setIsSessionActive(true);
            console.log('Session joined:', playerSnake);
        },

        snake_id: (data) => {
            console.log('Snake ID received:', data.snakeId);
            // setPlayerSnake({ snakeId: data.snakeId, sessionId }); // Neu: Bezieht sessionId
        },

        // game_state_update: (data) => {
        //     const { updates, food: updatedFood } = data;
        //
        //     // Spieler aktualisieren basierend auf den Deltas
        //     updates.forEach((update) => {
        //         const existingSnake = otherSnakes.current.find((snake) => snake.snakeId === update.snakeId);
        //
        //         if (existingSnake) {
        //             existingSnake.headPosition = update.headPosition;
        //             existingSnake.segmentCount = update.segmentCount;
        //             existingSnake.score = update.score;
        //         } else {
        //             // Füge eine neue Schlange hinzu, falls sie noch nicht existiert
        //             otherSnakes.current.push({
        //                 snakeId: update.snakeId,
        //                 headPosition: update.headPosition,
        //                 segmentCount: update.segmentCount,
        //                 score: update.score,
        //             });
        //         }
        //     });
        //
        //     // Nahrung aktualisieren
        //     food.current = updatedFood;
        // },

        session_broadcast: (data) => {
            otherSnakes.current = data.players; // Speichert alle Schlangen
            // boundaries.current = data.boundaries; // Speichert die Spielfeldgrenzen
            food.current = data.food; // Speichert die Nahrung
        },

        game_over: (data) => {
            setIsSessionActive(false);
            alert(`Game Over! Your score: ${data.score}`);
            console.log('Game over:', data);
        },

        remove_player: (data) => {
            console.log('Player removed:', data.snakeId);
            setOtherSnakes((prev) => {
                const updated = { ...prev };
                delete updated[data.snakeId];
                return updated;
            });
        },

        session_started: () => {
            console.log('Session started');
            setIsSessionActive(true);
        },

        session_ended: () => {
            console.log('Session ended');
            setIsSessionActive(false);
        },
    });

    useEffect(() => {
        // if (ws.current) {
        //     return;
        // }

        const socket = new WebSocket('ws://localhost:5000/');

        socket.onopen = () => {
            console.log('WebSocket connected');
            setIsReady(true);
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            setIsReady(false);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received message:', data);

            const handler = messageHandlers.current[data.type] || messageHandlers.current.default;
            try {
                handler(data); // Verarbeite die Nachricht
            } catch (error) {
                console.error(`Error handling message type "${data.type}":`, error);
            }
        };

        ws.current = socket;

        return () => {
            socket.close()
        }
    }, []); // Nur einmal bei der Initialisierung ausführen

    const sendMessage = (msg) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(msg));
        } else {
            console.warn('WebSocket is not ready to send messages.');
        }
    };

    const value = useMemo(() => ({
        isReady,
        playerSnake,
        otherSnakes,
        isSessionActive,
        sessionId, // Neu: Session-ID verfügbar machen
        boundaries,
        food,
        sendMessage,
    }), [isReady, playerSnake, otherSnakes, isSessionActive, sessionId, boundaries, food]);

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

WebSocketProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
