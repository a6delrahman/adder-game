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
const BOUNDARY = {width: 800, height: 600};

// Beispiel eines GameStates:
const initialGameState = {
    players: {}, // { snakeId: { headPosition, targetPosition, segments, queuedSegments, boost } }
    food: [], // Für Nahrung oder andere Objekte
    boundaries: BOUNDARY,
};


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


function addPlayerToSession(session, ws, fieldOfView, userId) {
    if (playerIndex.has(ws)) {
        removePlayerFromSession(ws); // Remove the player from the current session
    }

    const snakeId = uuidv4();
    const startPosition = getRandomPosition(BOUNDARY);
    // Spielerstatus erstellen
    const playerState = {
        snakeId,
        sessionId: session.id,
        userId,
        headPosition: startPosition,
        targetPosition: getRandomPosition(BOUNDARY),
        boost: false,
        speed: SNAKE_SPEED,
        segments: Array.from({length: SNAKE_INITIAL_LENGTH}, (_, i) => ({x: startPosition.x, y: startPosition.y + i * SNAKE_SPEED})),
        queuedSegments: 0,
        fieldOfView: fieldOfView,
        score: 0,
    };

    // Spieler zum GameState hinzufügen
    if (!gameStates.has(session.id)) {
        const initialGameStateWithFood = {...initialGameState};
        generateFood(initialGameStateWithFood, 10); // Generiere 10 Nahrungspunkte
        gameStates.set(session.id, initialGameStateWithFood);

        // gameStates.set(session.id, {...initialGameState});
    }
    const gameState = gameStates.get(session.id);
    gameState.players[snakeId] = playerState;

    // Spieler-Index aktualisieren
    playerIndex.set(ws, {sessionId: session.id, snakeId});

    // Nachricht an den Spieler senden
    ws.send(JSON.stringify({type: 'session_joined', playerState, initialGameState: initialGameState}));
}


function getAllSessions() {
    return sessions;
}


function broadcastGameState() {
    gameStates.forEach((gameState, sessionId) => {
        const {players, boundaries, food} = gameState;

        // Iteriere durch alle Spieler in der Sitzung
        Object.values(players).forEach((player) => {
            const nearbyPlayers = getNearbyPlayers(player, players, player.fieldOfView); // Spieler im Umkreis von 200px

            // Erstelle die Nachricht mit relevanten Daten
            const message = JSON.stringify({
                type: 'session_broadcast',
                players: nearbyPlayers.map(({snakeId, headPosition, segments, score}) => ({
                    snakeId,
                    headPosition,
                    segments, // Reduziert die Datenmenge
                    score, // Sende den Punktestand mit
                })),
                food, // Sende die Positionen der Nahrung mit
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
        if (player.snakeId === currentPlayer.snakeId) {
            nearbyPlayers.push(player); // Füge den aktuellen Spieler hinzu
        } else {
            const dx = player.headPosition.x - currentPlayer.headPosition.x;
            const dy = player.headPosition.y - currentPlayer.headPosition.y;

            // Prüfe, ob der Spieler innerhalb des Bereichs liegt
            if (Math.sqrt(dx * dx + dy * dy) <= currentPlayer.fieldOfView) {
                nearbyPlayers.push(player);
            }
        }
    });

    return nearbyPlayers;
}




function broadcastGameStateWithDeltas() {
    gameStates.forEach((gameState, sessionId) => {
        const {players, boundaries} = gameState;

        Object.values(players).forEach((player) => {
            const nearbyPlayers = getNearbyPlayers(player, players, boundaries, player.fieldOfView);

            // Erstelle das aktuelle Delta
            const currentState = nearbyPlayers.map(({snakeId, headPosition, segments}) => ({
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
                player.ws.send(JSON.stringify({type: 'game_state_update', updates: delta}));
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

    const {sessionId, snakeId} = playerInfo;

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
        player.targetPosition = {x: data.targetX, y: data.targetY};
    }

    player.boost = !!data.boost; // Stelle sicher, dass boost ein boolescher Wert ist

    console.log(`Updated movement for snakeId ${snakeId}:`, {
        targetPosition: player.targetPosition,
        boost: player.boost,
    });
}


// function movePlayers() {
//     // Iteriere durch alle aktiven Sitzungen
//     gameStates.forEach((gameState, sessionId) => {
//         const {players, boundaries, food} = gameState;
//
//         // Iteriere durch alle Spieler in der aktuellen Sitzung
//         Object.values(players).forEach((playerState) => {
//             // Berechne die Distanz zwischen der aktuellen Kopfposition und der Zielposition
//             const dx = playerState.targetPosition.x - playerState.headPosition.x;
//             const dy = playerState.targetPosition.y - playerState.headPosition.y;
//             const distance = Math.sqrt(dx * dx + dy * dy);
//
//             // Bestimme die Bewegungsgeschwindigkeit des Spielers (schneller bei Boost)
//             const speed = playerState.boost ? SNAKE_SPEED * 2 : SNAKE_SPEED;
//
//             // Wenn die Distanz größer als 0 ist (der Spieler bewegt sich):
//             if (distance > 0) {
//                 // Aktualisiere die Kopfposition des Spielers
//                 playerState.headPosition.x += (dx / distance) * speed;
//                 playerState.headPosition.y += (dy / distance) * speed;
//
//                 // Begrenze die Position, damit sie innerhalb des Spielfelds bleibt
//                 playerState.headPosition.x = Math.max(0, Math.min(playerState.headPosition.x, boundaries.width));
//                 playerState.headPosition.y = Math.max(0, Math.min(playerState.headPosition.y, boundaries.height));
//
//                 // Aktualisiere die Segmente der Schlange: neue Kopfposition hinzufügen
//                 playerState.segments.unshift({...playerState.headPosition});
//
//
//                 // Prüfen, ob der Spieler Nahrung einsammelt
//                 gameState.food = gameState.food.filter((foodPosition) => {
//                     const dx = foodPosition.x - playerState.headPosition.x;
//                     const dy = foodPosition.y - playerState.headPosition.y;
//
//                     if (Math.sqrt(dx * dx + dy * dy) < 10) { // Wenn die Distanz < 10px ist
//                         playerState.queuedSegments += 3; // Füge Segmente zur Schlange hinzu
//                         playerState.score = (playerState.score || 0) + 10; // Erhöhe den Punktestand
//                         return false; // Entferne das Essen
//                     }
//
//                     return true; // Behalte das Essen
//                 });
//
//                 Object.values(players).forEach((otherPlayer) => {
//                     if (playerState.snakeId !== otherPlayer.snakeId) {
//                         // Prüfe Kollision mit dem Kopf anderer Spieler
//                         const dx = playerState.headPosition.x - otherPlayer.headPosition.x;
//                         const dy = playerState.headPosition.y - otherPlayer.headPosition.y;
//
//                         if (Math.sqrt(dx * dx + dy * dy) < 10) {
//                             // Spieler-Kopf trifft Kopf des anderen Spielers
//                             const ws = getWebSocketBySnakeId(playerState.snakeId);
//                             ws.send(JSON.stringify({ type: 'game_over', score: playerState.score }));
//                             console.log(`Collision: ${playerState.snakeId} hit head of ${otherPlayer.snakeId}`);
//                             removePlayerFromSession(ws);
//                         }
//
//                         // Prüfe Kollision mit Segmenten der anderen Spieler
//                         otherPlayer.segments.forEach((segment) => {
//                             const dx = playerState.headPosition.x - segment.x;
//                             const dy = playerState.headPosition.y - segment.y;
//
//                             if (Math.sqrt(dx * dx + dy * dy) < 10) {
//                                 // Spieler-Kopf trifft ein Segment des anderen Spielers
//                                 const ws = getWebSocketBySnakeId(playerState.snakeId);
//                                 ws.send(JSON.stringify({ type: 'game_over', score: playerState.score }));
//                                 console.log(`Collision: ${playerState.snakeId} hit ${otherPlayer.snakeId}`);
//                                 removePlayerFromSession(ws);
//                             }
//                         });
//                     }
//                 });
//
//                 // Entferne überschüssige Segmente, um die maximale Länge einzuhalten
//                 if (playerState.segments.length > SNAKE_INITIAL_LENGTH + playerState.queuedSegments) {
//                     playerState.segments.pop();
//                 }
//             }
//         });
//     });
// }

function movePlayers() {
    gameStates.forEach((gameState, sessionId) => {
        const { players, boundaries, food } = gameState;

        // Position aller Spieler aktualisieren
        Object.values(players).forEach((playerState) => {
            movePlayer(playerState, boundaries);
            handleFoodCollision(playerState, gameState);
        });

        // Kollisionserkennung
        Object.values(players).forEach((playerState) => {
            checkPlayerCollisions(playerState, players);
        });
    });
}

// Bewegungslogik auslagern
function movePlayer(playerState, boundaries) {
    const dx = playerState.targetPosition.x - playerState.headPosition.x;
    const dy = playerState.targetPosition.y - playerState.headPosition.y;
    const distanceSquared = dx * dx + dy * dy;

    // Bewegung durchführen, wenn Distanz > 0
    if (distanceSquared > 0) {
        const speed = playerState.boost ? SNAKE_SPEED * 2 : SNAKE_SPEED;
        const distance = Math.sqrt(distanceSquared);

        playerState.headPosition.x += (dx / distance) * speed;
        playerState.headPosition.y += (dy / distance) * speed;

        // Begrenze Position auf Spielfeld
        playerState.headPosition.x = Math.max(0, Math.min(playerState.headPosition.x, boundaries.width));
        playerState.headPosition.y = Math.max(0, Math.min(playerState.headPosition.y, boundaries.height));

        // Neues Segment anfügen
        playerState.segments.unshift({ ...playerState.headPosition });

        // Überschüssige Segmente entfernen
        const maxSegments = SNAKE_INITIAL_LENGTH + playerState.queuedSegments;
        if (playerState.segments.length > maxSegments) {
            playerState.segments.pop();
        }
    }
}

// Nahrungskollisionen prüfen
function handleFoodCollision(playerState, gameState) {
    gameState.food = gameState.food.filter((foodPosition) => {
        const dx = foodPosition.x - playerState.headPosition.x;
        const dy = foodPosition.y - playerState.headPosition.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < 100) { // Abstand < 10px
            playerState.queuedSegments += 3; // Schlange verlängern
            playerState.score = (playerState.score || 0) + 10; // Punkte hinzufügen
            return false; // Nahrung wird entfernt
        }
        return true; // Nahrung bleibt
    });
}

// Kollisionsprüfung
function checkPlayerCollisions(currentPlayer, players) {
    Object.values(players).forEach((otherPlayer) => {
        if (currentPlayer.snakeId === otherPlayer.snakeId) return;

        // Prüfe Kopf-zu-Kopf-Kollision
        if (checkCollision(currentPlayer.headPosition, otherPlayer.headPosition)) {
            handlePlayerCollision(currentPlayer);
        }

        // Prüfe Kopf-zu-Segment-Kollision
        otherPlayer.segments.forEach((segment) => {
            if (checkCollision(currentPlayer.headPosition, segment)) {
                handlePlayerCollision(currentPlayer);
            }
        });
    });
}

// Hilfsfunktion: Kollision erkennen
function checkCollision(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return dx * dx + dy * dy < 100; // Abstand < 10px
}

// Kollisionsverarbeitung
function handlePlayerCollision(playerState) {
    const ws = getWebSocketBySnakeId(playerState.snakeId);
    if (ws) {
        ws.send(JSON.stringify({ type: 'game_over', score: playerState.score }));
    }
    console.log(`Collision: Player ${playerState.snakeId} eliminated`);
    removePlayerFromSession(ws);
}



function leaveSession(ws) {
    removePlayerFromSession(ws)
}

function removePlayerFromSession(ws) {
    const playerInfo = playerIndex.get(ws);
    if (!playerInfo) return;

    const {sessionId, snakeId} = playerInfo;
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


// Funktion: Zufällige Position im Spielfeld generieren
function getRandomPosition(boundaries) {
    return {
        x: Math.floor(Math.random() * boundaries.width),
        y: Math.floor(Math.random() * boundaries.height),
    };
}

// Funktion: Nahrung hinzufügen
function generateFood(gameState, count = 5) {
    for (let i = 0; i < count; i++) {
        gameState.food.push(getRandomPosition(gameState.boundaries));
    }
}

function dropSpecialFood(playerState, gameState) {
    const SPECIAL_FOOD_SPREAD = 20; // Maximaler Versatz um die Segmente
    const SPECIAL_FOOD_POINTS = 50; // Mehr Punkte als normale Nahrung

    playerState.segments.forEach(segment => {
        const randomOffsetX = Math.random() * SPECIAL_FOOD_SPREAD * 2 - SPECIAL_FOOD_SPREAD;
        const randomOffsetY = Math.random() * SPECIAL_FOOD_SPREAD * 2 - SPECIAL_FOOD_SPREAD;

        // Spezialnahrung hinzufügen
        gameState.food.push({
            x: segment.x + randomOffsetX,
            y: segment.y + randomOffsetY,
            special: true, // Markierung als Spezialnahrung
            points: SPECIAL_FOOD_POINTS, // Punktewert
        });
    });
}



module.exports = {
    createOrFindSession,
    addPlayerToSession,
    getAllSessions,
    broadcastGameState,
    handleMovement,
    movePlayers,
    leaveSession,
    removePlayerFromSession
};
