// services/sessionService.js
const {v4: uuidv4} = require('uuid');

const sessions = new Map();
const gameStates = new Map(); // Separate GameState-Verwaltung für jedes Spiel
const playerIndex = new Map(); // { ws: { sessionId, snakeId } }
const lastSentStates = new Map(); // { playerId: { lastState } }

const SNAKE_SPEED = 2;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const SNAKE_INITIAL_LENGTH = 50;

// Beispiel eines GameStates:
const initialGameState = {
    players: {}, // { snakeId: { headPosition, targetPosition, segments, queuedSegments, boost } }
    food: [], // Für Nahrung oder andere Objekte
    boundaries: { width: FIELD_WIDTH, height: FIELD_HEIGHT },
};

// function createOrFindSession(gameType, ws, userId = null) {
//     let session = Array.from(sessions.values()).find(
//         (sess) => sess.gameType === gameType && sess.players.length < sess.maxPlayers
//     );
//
//     if (!session) {
//         session = {
//             id: uuidv4(),
//             gameType,
//             players: [],
//             maxPlayers: 4
//         };
//         sessions.set(session.id, session);
//     }
//
//     if (!session.players.some(player => player.ws === ws)) {
//         const snakeId = uuidv4();
//         const playerState = {
//             snakeId,
//             sessionId: session.id,
//             userId,
//             ws,
//             headPosition: { x: 100, y: 100 },
//             targetPosition: { x: 100, y: 100 },
//             boost: false,
//             segments: Array.from({ length: SNAKE_INITIAL_LENGTH }, (_, i) => ({ x: 100, y: 100 + i * SNAKE_SPEED })),
//             queuedSegments: 0,
//         };
//         session.players.push(playerState);
//         ws.send(JSON.stringify({type: 'session_joined', playerState}));
//         // ws.send(JSON.stringify({ type: 'snake_id', snakeId }));
//     }
// }

function createOrFindSession(gameType) {
    let session = Array.from(sessions.values()).find(
        (sess) => sess.gameType === gameType
    );

    if (!session) {
        session = {
            id: uuidv4(),
            gameType,
        };
        sessions.set(session.id, session);
    }

    return session;
}


function addPlayerToSession(session, ws, userId) {
    if (playerIndex.has(ws)) {
        removePlayerFromSession(ws); // Remove the player from the current session
    }

    const snakeId = uuidv4();

    // Spielerstatus erstellen
    const playerState = {
        snakeId,
        sessionId: session.id,
        userId,
        headPosition: { x: 100, y: 100 },
        targetPosition: { x: 100, y: 100 },
        boost: false,
        speed: SNAKE_SPEED,
        segments: Array.from({ length: SNAKE_INITIAL_LENGTH }, (_, i) => ({ x: 100, y: 100 + i * SNAKE_SPEED })),
        queuedSegments: 0,
    };

    // Spieler zum GameState hinzufügen
    if (!gameStates.has(session.id)) {
        gameStates.set(session.id, { ...initialGameState });
    }
    const gameState = gameStates.get(session.id);
    gameState.players[snakeId] = playerState;

    // Spieler-Index aktualisieren
    playerIndex.set(ws, { sessionId: session.id, snakeId });

    // Nachricht an den Spieler senden
    ws.send(JSON.stringify({ type: 'session_joined', playerState }));
}






function getSession(sessionId) {
    return sessions.get(sessionId);
}

function getAllSessions() {
    return sessions;
}

// function broadcastGameState() {
//     sessions.forEach(session => {
//         const allPlayerData = session.players.map(({ headPosition, segments, snakeId }) => ({
//             snakeId,
//             headPosition,
//             segments,
//         }));
//
//         const message = JSON.stringify({ type: 'session_broadcast', players: allPlayerData });
//
//         session.players.forEach(player => {
//             if (player.ws.readyState === WebSocket.OPEN) {
//                 player.ws.send(message);
//             }
//         });
//     });
// }

function broadcastGameState() {
    gameStates.forEach((gameState, sessionId) => {
        const { players, boundaries } = gameState;

        // Iteriere durch alle Spieler in der Sitzung
        Object.values(players).forEach((player) => {
            const nearbyPlayers = getNearbyPlayers(player, players, boundaries, 200); // Spieler im Umkreis von 200px

            // Erstelle die Nachricht mit relevanten Daten
            const message = JSON.stringify({
                type: 'session_broadcast',
                players: nearbyPlayers.map(({ snakeId, headPosition, segments }) => ({
                    snakeId,
                    headPosition,
                    segments, // Reduziert die Datenmenge
                })),
            });

            // Abrufen des WebSocket für den aktuellen Spieler
            const ws = getWebSocketBySnakeId(player.snakeId);

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(message); // Nachricht an den Spieler senden
            }
        });
    });
}

function getWebSocketBySnakeId(snakeId) {
    for (const [ws, playerInfo] of playerIndex.entries()) {
        if (playerInfo.snakeId === snakeId) {
            return ws;
        }
    }
    return null; // Return null if no matching snakeId is found
}

// Hilfsfunktion: Spieler im Umkreis finden
function getNearbyPlayers(currentPlayer, allPlayers, boundaries, range) {
    const nearbyPlayers = [];

    Object.values(allPlayers).forEach((player) => {
        if (player.snakeId !== currentPlayer.snakeId) {
            nearbyPlayers.push(player); // Füge den aktuellen Spieler hinzu
        } else {
            const dx = player.headPosition.x - currentPlayer.headPosition.x;
            const dy = player.headPosition.y - currentPlayer.headPosition.y;

            // Prüfe, ob der Spieler innerhalb des Bereichs liegt
            if (Math.sqrt(dx * dx + dy * dy) <= range) {
                nearbyPlayers.push(player);
            }
        }
    });

    return nearbyPlayers;
}



function broadcastGameStateWithDeltas() {
    gameStates.forEach((gameState, sessionId) => {
        const { players, boundaries } = gameState;

        Object.values(players).forEach((player) => {
            const nearbyPlayers = getNearbyPlayers(player, players, boundaries, 200);

            // Erstelle das aktuelle Delta
            const currentState = nearbyPlayers.map(({ snakeId, headPosition, segments }) => ({
                snakeId,
                headPosition,
                segmentCount: segments.length,
            }));

            const lastState = lastSentStates.get(player.snakeId) || [];
            const delta = calculateDelta(lastState, currentState);

            // Speichere den aktuellen Zustand
            lastSentStates.set(player.snakeId, currentState);

            // Sende nur, wenn es Änderungen gibt
            if (delta.length > 0 && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(JSON.stringify({ type: 'game_state_update', updates: delta }));
            }
        });
    });
}

// Hilfsfunktion: Delta berechnen
function calculateDelta(lastState, currentState) {
    const delta = [];

    currentState.forEach((current) => {
        const last = lastState.find((p) => p.snakeId === current.snakeId);
        if (!last || JSON.stringify(last) !== JSON.stringify(current)) {
            delta.push(current);
        }
    });

    return delta;
}



// function handleMovement(data, ws) {
//     const session = getSessionByPlayerSocket(ws);
//     if (session) {
//         const player = session.players.find(player => player.ws === ws);
//         if (player) {
//             player.targetPosition = { x: data.targetX, y: data.targetY };
//             player.boost = data.boost || false;
//         } else {
//             console.error('Player not found in the session');
//         }
//     } else {
//         console.error('Session not found for the given WebSocket');
//     }
// }

function handleMovement(data, ws) {
    if (isNaN(data.targetX) || isNaN(data.targetY)) {
        console.error('Invalid target coordinates');
        return;
    }

    // Spielerinformationen über den Index finden
    const playerInfo = playerIndex.get(ws);
    if (!playerInfo) {
        console.error('Player not found for WebSocket');
        return;
    }

    const { sessionId, snakeId } = playerInfo;

    // Spielstatus der Session abrufen
    const gameState = gameStates.get(sessionId);
    if (!gameState) {
        console.error(`GameState not found for sessionId: ${sessionId}`);
        return;
    }

    const player = gameState.players[snakeId];
    if (!player) {
        console.error(`Player not found in GameState for snakeId: ${snakeId}`);
        return;
    }

    // Zielposition und Boost-Status aktualisieren
    if (data.targetX !== undefined && data.targetY !== undefined) {
        player.targetPosition = { x: data.targetX, y: data.targetY };
    }

    player.boost = !!data.boost; // Stelle sicher, dass boost ein boolescher Wert ist

    console.log(`Updated movement for snakeId ${snakeId}:`, {
        targetPosition: player.targetPosition,
        boost: player.boost,
    });
}


function getSessionByPlayerSocket(ws) {
    return Array.from(sessions.values()).find(session => session.players.some(player => player.ws === ws));
}

// function movePlayers() {
//     // Iteriere durch alle aktiven Sitzungen im Spiel
//     sessions.forEach(session => {
//         // Iteriere durch alle Spielerzustände in einer Sitzung
//         session.players.forEach(playerState => {
//             // Berechne die Distanz zwischen der aktuellen Kopfposition und der Zielposition
//             const dx = playerState.targetPosition.x - playerState.headPosition.x; // Unterschied in x-Richtung
//             const dy = playerState.targetPosition.y - playerState.headPosition.y; // Unterschied in y-Richtung
//             const distance = Math.sqrt(dx * dx + dy * dy); // Euklidische Distanz
//
//             // Bestimme die Bewegungsgeschwindigkeit des Spielers (schneller bei Boost)
//             const speed = playerState.boost ? SNAKE_SPEED * 2 : SNAKE_SPEED;
//
//             // Wenn die Distanz zum Ziel größer als 0 ist (der Spieler hat sich noch nicht ganz bewegt):
//             if (distance > 0) {
//                 // Bewege den Kopf des Spielers proportional zur Distanz
//                 playerState.headPosition.x += (dx / distance) * speed; // Schritt in x-Richtung
//                 playerState.headPosition.y += (dy / distance) * speed; // Schritt in y-Richtung
//
//                 // Begrenze die Kopfposition, damit sie im Spielfeld bleibt
//                 playerState.headPosition.x = Math.max(0, Math.min(playerState.headPosition.x, FIELD_WIDTH)); // Begrenzung in x-Richtung
//                 playerState.headPosition.y = Math.max(0, Math.min(playerState.headPosition.y, FIELD_HEIGHT)); // Begrenzung in y-Richtung
//
//                 // Aktualisiere die Schlangensegmente: füge die neue Kopfposition als erstes Segment hinzu
//                 playerState.segments.unshift({ ...playerState.headPosition });
//
//                 // Entferne das letzte Segment, wenn die Länge die erlaubte maximale Länge übersteigt
//                 if (playerState.segments.length > SNAKE_INITIAL_LENGTH + playerState.queuedSegments) {
//                     playerState.segments.pop(); // Kürzt die Schlange am Ende
//                 }
//             }
//         });
//     });
// }

function movePlayers() {
    // Iteriere durch alle aktiven Sitzungen
    gameStates.forEach((gameState, sessionId) => {
        const { players, boundaries } = gameState;

        // Iteriere durch alle Spieler in der aktuellen Sitzung
        Object.values(players).forEach((playerState) => {
            // Berechne die Distanz zwischen der aktuellen Kopfposition und der Zielposition
            const dx = playerState.targetPosition.x - playerState.headPosition.x;
            const dy = playerState.targetPosition.y - playerState.headPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Bestimme die Bewegungsgeschwindigkeit des Spielers (schneller bei Boost)
            const speed = playerState.boost ? SNAKE_SPEED * 2 : SNAKE_SPEED;

            // Wenn die Distanz größer als 0 ist (der Spieler bewegt sich):
            if (distance > 0) {
                // Aktualisiere die Kopfposition des Spielers
                playerState.headPosition.x += (dx / distance) * speed;
                playerState.headPosition.y += (dy / distance) * speed;

                // Begrenze die Position, damit sie innerhalb des Spielfelds bleibt
                playerState.headPosition.x = Math.max(0, Math.min(playerState.headPosition.x, boundaries.width));
                playerState.headPosition.y = Math.max(0, Math.min(playerState.headPosition.y, boundaries.height));

                // Aktualisiere die Segmente der Schlange: neue Kopfposition hinzufügen
                playerState.segments.unshift({ ...playerState.headPosition });

                // Entferne überschüssige Segmente, um die maximale Länge einzuhalten
                if (playerState.segments.length > SNAKE_INITIAL_LENGTH + playerState.queuedSegments) {
                    playerState.segments.pop();
                }
            }
        });
    });
}


function leaveSession(ws) {
    removePlayerFromSession(ws)
    // const session = getSessionByPlayerSocket(ws);
    // if (session) {
    //     session.players = session.players.filter(player => player.ws !== ws);
    //     if (session.players.length === 0) {
    //         sessions.delete(session.id);
    //     }
    // }
}

function removePlayerFromSession(ws) {
    const playerInfo = playerIndex.get(ws);
    if (!playerInfo) return;

    const { sessionId, snakeId } = playerInfo;
    const gameState = gameStates.get(sessionId);

    if (gameState) {
        delete gameState.players[snakeId];

        // Entferne Session, wenn sie leer ist
        if (Object.keys(gameState.players).length === 0) {
            gameStates.delete(sessionId);
            sessions.delete(sessionId);
        }
    }

    playerIndex.delete(ws);
}


module.exports = { createOrFindSession, addPlayerToSession, getAllSessions, broadcastGameState, handleMovement, movePlayers, leaveSession, removePlayerFromSession };
