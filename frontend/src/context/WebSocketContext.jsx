// WebSocketContext.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const playerSnake = useRef(null); // Referenz auf die eigene Snake-Instanz
    const otherSnakes = useRef([]); // Speichert die Schlangen anderer Spieler
    const [isSessionActive, setIsSessionActive] = useState(false);
    const sessionId = useRef(null); // Neu: Speichert die aktuelle Session-ID
    const ws = useRef(null);

    const messageHandlers = useRef({
        default: (data) => console.warn(`Unhandled message type: ${data.type}`, data),

        connect: (data) => {
            console.log('Connected, clientId:', data.clientId);
        },

        session_joined: (data) => {
            playerSnake.current = data.playerState; // Speichert die eigene Schlange
            sessionId.current = data.playerState.sessionId; // Speichert die Session-ID
            console.log('Session joined:', playerSnake);
        },

        snake_id: (data) => {
            console.log('Snake ID received:', data.snakeId);
            // setPlayerSnake({ snakeId: data.snakeId, sessionId }); // Neu: Bezieht sessionId
        },

        session_broadcast: (data) => {
            // const updatedSnakes = {};
            // data.players.forEach((player) => {
            //     if (player.snakeId === playerSnake.current.snakeId) {
            //         playerSnake.current.headPosition = player.headPosition; // Aktualisiert die eigene Schlange
            //         playerSnake.current.segments = player.segments;
            //     } else {
            //         updatedSnakes[player.snakeId] = player; // Aktualisiert andere Schlangen
            //     }
            // });
            otherSnakes.current = data.players; // Speichert alle Schlangen
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
        const socket = new WebSocket('ws://localhost:5000/');
        ws.current = socket;

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

        return () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
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
        sendMessage,
    }), [isReady, playerSnake, otherSnakes, isSessionActive, sessionId]);

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
