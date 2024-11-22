// services/sessionService.js
const {v4: uuidv4} = require('uuid');

const sessions = new Map();
const gameStates = new Map(); // Separate GameState-Verwaltung für jedes Spiel
const playerIndex = new Map(); // { ws: { sessionId, snakeId } }
const lastSentStates = new Map(); // { playerId: { lastState } }

const SNAKE_SPEED = 2;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const SNAKE_INITIAL_LENGTH = 20;
const BOUNDARY = {width: 800, height: 600};

const ZONE_COUNT = 4; // Gittergröße 4x4
const MIN_FOOD_PER_ZONE = 2; // Mindestens 2 Nahrungspunkte pro Zone
const MAX_FOOD_PER_ZONE = 5; // Maximal 5 Nahrungspunkte pro Zone

function createInitialGameState() {
    return {
        players: {}, // { snakeId: { headPosition, targetPosition, segments, queuedSegments, boost } }
        food: [], // Für Nahrung oder andere Objekte
        boundaries: { width: FIELD_WIDTH, height: FIELD_HEIGHT },
    };
}

function createOrFindSession(gameType) {
    let session = Array.from(sessions.values()).find(
        (sess) => sess.gameType === gameType
    );

    if (!session) {
        session = {
            id: uuidv4(),
            gameType,
            maxsize: 100,
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
        const initialGameStateWithFood = createInitialGameState();
        generateRandomFood(initialGameStateWithFood, 10); // Generiere 10 Nahrungspunkte
        gameStates.set(session.id, initialGameStateWithFood);

        // gameStates.set(session.id, {...initialGameState});
    }
    const gameState = gameStates.get(session.id);
    gameState.players[snakeId] = playerState;

    // Spieler-Index aktualisieren
    playerIndex.set(ws, {sessionId: session.id, snakeId});

    // Nachricht an den Spieler senden
    ws.send(JSON.stringify({type: 'session_joined', playerState, initialGameState: gameState}));
}


function calculateZones(boundaries, zoneCount) {
    const zoneWidth = boundaries.width / zoneCount;
    const zoneHeight = boundaries.height / zoneCount;
    const zones = [];

    for (let x = 0; x < zoneCount; x++) {
        for (let y = 0; y < zoneCount; y++) {
            zones.push({
                x: x * zoneWidth,
                y: y * zoneHeight,
                width: zoneWidth,
                height: zoneHeight,
                foodCount: 0, // Anzahl der Nahrungspunkte in der Zone
            });
        }
    }

    return zones;
}


function updateZoneFoodCounts(gameState, zones) {
    // Zähler für jede Zone zurücksetzen
    zones.forEach((zone) => zone.foodCount = 0);

    // Nahrungspunkte jeder Zone zuordnen
    gameState.food.forEach((food) => {
        const zone = zones.find(
            (z) =>
                food.x >= z.x &&
                food.x < z.x + z.width &&
                food.y >= z.y &&
                food.y < z.y + z.height
        );

        if (zone) {
            zone.foodCount++;
        }
    });
}

function replenishFoodInZones(gameState, zones, minFoodPerZone, maxFoodPerZone) {
    zones.forEach((zone) => {
        if (zone.foodCount < minFoodPerZone) {
            const missingFood = maxFoodPerZone - zone.foodCount;

            for (let i = 0; i < missingFood; i++) {
                const foodPosition = {
                    x: Math.random() * zone.width + zone.x,
                    y: Math.random() * zone.height + zone.y,
                };

                const food = generateFood(foodPosition, randomizedNumber(1, 5));
                if (food) {
                    gameState.food.push(food);
                }
            }
        }
    });
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

            // Abrufen des WebSocket für den aktuellen Spieler
            const ws = getWebSocketBySnakeId(player.snakeId);

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(message); // Nachricht an den Spieler senden
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

    // Boost nur aktivieren, wenn Punkte > 0 sind
    player.boost = !!(data.boost && player.score > 0);

    console.log(`Updated movement for snakeId ${snakeId}:`, {
        targetPosition: player.targetPosition,
        boost: player.boost,
    });
}


function movePlayers() {
    gameStates.forEach((gameState, sessionId) => {
        const { players, boundaries, food } = gameState;

        // Zonen berechnen und Nahrung zählen
        const zones = calculateZones(boundaries, ZONE_COUNT);
        updateZoneFoodCounts(gameState, zones);

        // Nahrung in unterversorgten Zonen ergänzen
        replenishFoodInZones(gameState, zones, MIN_FOOD_PER_ZONE, MAX_FOOD_PER_ZONE);


        // Position aller Spieler aktualisieren
        Object.values(players).forEach((playerState) => {
            movePlayer(playerState, boundaries);
            handleFoodCollision(playerState, gameState);

            // Boost-Punkteabzug verarbeiten
            handleBoostPenalty(playerState, gameState);
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

function handleBoostPenalty(playerState, gameState) {
    if (playerState.boost) {
        // Score sicherstellen, dass er nicht negativ wird
        if (playerState.score <= 0) {
            playerState.score = 0; // Sicherstellen, dass der Score nicht negativ ist
            playerState.boost = false; // Boost deaktivieren
            return; // Keine weiteren Aktionen durchführen
        }

        const POINT_LOSS = 1; // Punkteverlust pro Boost-Zyklus
        const TAIL_DROP_SPREAD = 20; // Versatz um das Schwanzsegment

        // Punkteabzug
        playerState.score -= POINT_LOSS;

        // Schwanzsegment ermitteln
        const tailSegment = playerState.segments[playerState.segments.length - 1];

        // Nahrung fallen lassen
        if (tailSegment) {
            const randomOffsetX = Math.random() * TAIL_DROP_SPREAD * 2 - TAIL_DROP_SPREAD;
            const randomOffsetY = Math.random() * TAIL_DROP_SPREAD * 2 - TAIL_DROP_SPREAD;

            const food = generateFood(
                { x: tailSegment.x + randomOffsetX, y: tailSegment.y + randomOffsetY },
                POINT_LOSS
            );
            if (food) gameState.food.push(food);
        }
    }
}



// Nahrungskollisionen prüfen
function handleFoodCollision(playerState, gameState) {
    gameState.food = gameState.food.filter((food) => {
        const dx = food.x - playerState.headPosition.x;
        const dy = food.y - playerState.headPosition.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < 100) { // Abstand < 10px
            if (food.meta?.result !== undefined) {
                // Mathematikaufgabe prüfen
                // todo: Implement logic to check if the result is correct
                const correctResult = playerState.currentEquation?.result;
                if (food.meta.result === correctResult) {
                    playerState.score += 50; // Richtig
                } else {
                    playerState.score = Math.max(0, playerState.score - 50); // Falsch
                }
            } else {
                // Normale Nahrung
                playerState.score += food.points;
                playerState.queuedSegments += food.points;
            }
            return false; // Nahrung entfernen
        }
        return true; // Nahrung bleibt
    });
}



function generateFood(position, points, meta = null) {
    if (!position || points < 1 || isNaN(position.x) || isNaN(position.y) || isNaN(points)) return null;

    return {
        x: position.x,
        y: position.y,
        points,
        meta, // Optional: Zusätzliche Informationen (z. B. Mathematikaufgabe)
    };
}

function generateRandomFood(gameState, count = 5) {
    for (let i = 0; i < count; i++) {
        const position = getRandomPosition(gameState.boundaries);
        const points = randomizedNumber(1, 5);
        const food = generateFood(position, points);
        if (food) gameState.food.push(food);
    }
}

function generateMathFood(gameState, equation, result, spread = 50) {
    const position = {
        x: Math.random() * gameState.boundaries.width,
        y: Math.random() * gameState.boundaries.height,
    };
    const food = generateFood(position, 50, { equation, result }); // Speichert Aufgabe und Lösung im meta-Feld
    if (food) gameState.food.push(food);
}


function randomizedNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function dropSpecialFood(playerState, gameState) {
    const SPECIAL_FOOD_SPREAD = 10;

    playerState.segments.forEach((segment, index) => {
        if (index % 9 === 0) {
            const randomOffsetX = Math.random() * SPECIAL_FOOD_SPREAD * 2 - SPECIAL_FOOD_SPREAD;
            const randomOffsetY = Math.random() * SPECIAL_FOOD_SPREAD * 2 - SPECIAL_FOOD_SPREAD;

            const food = generateFood(
                { x: segment.x + randomOffsetX, y: segment.y + randomOffsetY },
                9 // Fester Punktwert
            );
            if (food) gameState.food.push(food);
        }
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
    const sessionId = playerState.sessionId;
    const gameState = gameStates.get(sessionId);

    if (gameState) {
        // Spezialnahrung fallen lassen
        dropSpecialFood(playerState, gameState);
    }

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

    const { sessionId, snakeId } = playerInfo;
    const gameState = gameStates.get(sessionId);

    if (gameState) {
        const playerState = gameState.players[snakeId];
        if (playerState) {
            // // Spezialnahrung fallen lassen
            // dropSpecialFood(playerState, gameState);

            // Spieler entfernen
            delete gameState.players[snakeId];
        }

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
