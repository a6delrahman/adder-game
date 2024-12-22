// services/sessionService.js
const {v4: uuidv4} = require('uuid');
const {equationManager} = require('../utils/mathEquations');
const WebSocket = require('ws');
const path = require('path');
const Snake = require('../classes/Snake');
const {saveFinalScore} = require("../models/ScoresModel");


const sessions = new Map();
const gameStates = new Map();
const playerIndex = new Map();
const lastSentStates = new Map();


const GAMEBOUNDARIES = {width: 2000, height: 2000};

const ZONE_COUNT = 10; // Gittergröße 4x4
const MIN_FOOD_PER_ZONE = 2; // Mindestens 2 Nahrungspunkte pro Zone
const MAX_FOOD_PER_ZONE = 5; // Maximal 5 Nahrungspunkte pro Zone

let sessionActive = false;

const isSessionActive = () => sessionActive;

const setActiveSessions = (value) => {
    sessionActive = value;
};

function createInitialGameState() {
    const gameState = {
        players: {},
        food: [],
        boundaries: GAMEBOUNDARIES,
    };

    generateRandomFood(gameState, 10);

    return gameState;
}

async function createOrFindSession(gameType) {
    let session = Array.from(sessions.values()).find(
        (sess) => sess.gameType === gameType
    );

    if (!session) {
        session = {
            id: uuidv4(),
            gameType,
            maxsize: 100,
        };
        equationManager.initializeEquationsForSession(session.id, session.gameType);
        sessions.set(session.id, session);
        setActiveSessions(true);
    }

    return session;
}

function generateRandomColor() {
    // Zufällige Zahl zwischen 0 und 16777215 (0xFFFFFF) generieren
    const randomColor = Math.floor(Math.random() * 16777216);
    // Zahl in eine hexadezimale Zeichenfolge umwandeln und mit führenden Nullen auffüllen
    return `#${randomColor.toString(16).padStart(6, '0')}`;
}


async function addPlayerToSession(gameType, ws, fieldOfView, userId) {
    if (playerIndex.has(ws)) {
        removePlayerFromSession(ws);
    }

    const session = await createOrFindSession(gameType);

    const snakeId = uuidv4();
    const startPosition = getRandomPosition(GAMEBOUNDARIES);
    const targetPosition = getRandomPosition(GAMEBOUNDARIES);
    const color = generateRandomColor();

    const playerSnake = new Snake(snakeId, startPosition, targetPosition, {
        color: color,
    });

    const playerState = {
        snakeId,
        sessionId: session.id,
        userId,
        snake: playerSnake,
        // targetPosition: getRandomPosition(GAMEBOUNDARIES),
        boost: false,
        fieldOfView,
        level: 1,
        currentEquation: null,
        score: 0,
    };

    assignNewMathEquation(playerState); // Neue Mathematikaufgabe zuweisen

    // Generiere und weise eine Aufgabe zu
    equationManager.addEquationsForSession(session.id, session.gameType, 5, playerState.level);
    equationManager.assignEquationToPlayer(session.id, playerState, session.gameType);


    // Spieler zum GameState hinzufügen
    if (!gameStates.has(session.id)) {
        const initialGameState = createInitialGameState();
        gameStates.set(session.id, {...initialGameState});
    }
    const gameState = gameStates.get(session.id);
    gameState.players[snakeId] = playerState;
    gameState.food.push(generateMathFoodOptions(gameState.boundaries, playerState));

    // Spieler-Index aktualisieren
    playerIndex.set(ws, {sessionId: session.id, snakeId, userId});

    return {
        snakeId,
        initialGameState: gameState,
    };
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
    gameStates.forEach((gameState) => {
        const {players, food} = gameState;

        // Iteriere durch alle Spieler in der Sitzung
        Object.values(players).forEach((player) => {
            const nearbyPlayers = getNearbyPlayers(player, players); // Spieler im Umkreis von 200px

            // Erstelle die Nachricht mit relevanten Daten
            const message = JSON.stringify({
                type: 'session_broadcast',
                players: nearbyPlayers.map(({snakeId, headPosition, segments,currentEquation, score}) => ({
                    snakeId,
                    headPosition,
                    segments,
                    currentEquation,
                    score,
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
function getNearbyPlayers(currentPlayer, allPlayers) {
    const nearbyPlayers = [];

    Object.values(allPlayers).forEach((player) => {
        if (player.snakeId === currentPlayer.snakeId) {
            player.currentEquation = currentPlayer.currentEquation; // Übertrage die aktuelle Aufgabe
            nearbyPlayers.push(player.snake); // Füge den aktuellen Spieler hinzu
        } else {
            const dx = player.snake.headPosition.x - currentPlayer.snake.headPosition.x;
            const dy = player.snake.headPosition.y - currentPlayer.snake.headPosition.y;

            // Prüfe, ob der Spieler innerhalb des Bereichs liegt
            if (Math.sqrt(dx * dx + dy * dy) <= currentPlayer.fieldOfView) {
                nearbyPlayers.push(player.snake);
            }
        }
    });

    return nearbyPlayers;
}


function broadcastGameStateWithDeltas() {
    gameStates.forEach((gameState, sessionId) => {
        const {players, boundaries} = gameState;

        Object.values(players).forEach((player) => {
            const nearbyPlayers = getNearbyPlayers(player, players, boundaries);

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

async function updatePlayerMovement(data, ws) {
    const {targetX, targetY, boost} = data;

    const playerInfo = playerIndex.get(ws);
    if (!playerInfo) {
        throw new Error('Player not found for WebSocket');
    }

    const {sessionId, snakeId} = playerInfo;
    const gameState = gameStates.get(sessionId);
    if (!gameState) {
        throw new Error(`Game state not found for session ID: ${sessionId}`);
    }

    const player = gameState.players[snakeId];
    if (!player) {
        throw new Error(`Player not found in game state for snake ID: ${snakeId}`);
    }

    // Update player movement
    if (targetX !== undefined && targetY !== undefined) {
        player.snake.updateDirection(targetX, targetY);
    }

    // Update boost state only if the player has enough score
    if (boost && player.score > 0) {
        player.snake.setBoost(true);
    } else {
        player.snake.setBoost(false);
    }
}


function handleMovement(data, ws) {
    const {targetX, targetY, boost} = data;

    if (isNaN(targetX) || isNaN(targetY)) {
        throw new Error('Invalid target coordinates');
    }

    // Spielerinformationen über den Index finden
    const playerInfo = playerIndex.get(ws);
    if (!playerInfo) {
        throw new Error('Player not found for WebSocket');
    }

    const {sessionId, snakeId} = playerInfo;
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

    // Zielposition aktualisieren
    if (targetX !== undefined && targetY !== undefined) {
        player.snake.updateDirection(targetX, targetY);
    }

    // Boost nur aktivieren, wenn Punkte > 0 sind
    // Update boost state only if the player has enough score
    if (boost && player.score > 0) {
        player.snake.setBoost(true);
    } else {
        player.snake.setBoost(false);
    }
}

function movePlayers() {
    gameStates.forEach((gameState, sessionId) => {
        const {players, boundaries} = gameState;

        // Zonen berechnen und Nahrung zählen
        const zones = calculateZones(boundaries, ZONE_COUNT);
        updateZoneFoodCounts(gameState, zones);

        // Nahrung in unterversorgten Zonen ergänzen
        replenishFoodInZones(gameState, zones, MIN_FOOD_PER_ZONE, MAX_FOOD_PER_ZONE);

        // Bewegung und Nahrungskollisionen für alle Spieler verarbeiten
        Object.values(players).forEach((playerState) => {
            movePlayer(playerState, boundaries);
            handleFoodCollision(playerState, gameState);
            handleBoostPenalty(playerState, gameState);
        });

        // Kollisionserkennung
        Object.values(players).forEach((playerState) => {
            checkPlayerCollisions(playerState, players);
        });
    });
}




function movePlayer(playerState, boundaries) {
    playerState.snake.moveSnake(boundaries);
}

// function handleBoostPenalty(playerState, gameState) {
//     const { snake } = playerState;
//     const droppedFood = snake.applyBoostPenalty(1);
//
//     if (droppedFood.length > 0) {
//         gameState.food.push(...droppedFood);
//     }
// }


function handleBoostPenalty(playerState, gameState) {
    const {snake} = playerState;
    if (snake.boost) {
        // Score sicherstellen, dass er nicht negativ wird
        if (playerState.score <= 0) {
            playerState.score = 0; // Sicherstellen, dass der Score nicht negativ ist
            snake.setBoost(false); // Boost deaktivieren
            return; // Keine weiteren Aktionen durchführen
        }

        const POINT_LOSS = 1; // Punkteverlust pro Boost-Zyklus
        const TAIL_DROP_SPREAD = 20; // Versatz um das Schwanzsegment

        // Punkteabzug
        playerState.score -= POINT_LOSS;
        snake.score -= POINT_LOSS;
        snake.segmentCount -= POINT_LOSS;

        // Schwanzsegment ermitteln
        // const tailSegment = snake.segments[snake.segments.length - 1];
        const tailSegment = snake.segments.pop();

        // Nahrung fallen lassen
        if (tailSegment) {
            const randomOffsetX = Math.random() * TAIL_DROP_SPREAD * 2 - TAIL_DROP_SPREAD;
            const randomOffsetY = Math.random() * TAIL_DROP_SPREAD * 2 - TAIL_DROP_SPREAD;

            const food = generateFood(
                {x: tailSegment.x + randomOffsetX, y: tailSegment.y + randomOffsetY},
                POINT_LOSS
            );
            if (food) gameState.food.push(food);
        }
    }
}

function handleFoodCollision(playerState, gameState) {
    const {snake} = playerState;

    gameState.food = gameState.food.filter(food => {
        if (snake.checkCollisionWithFood(food)) {
            playerState.score += food.points;
            snake.score += food.points;
            snake.segmentCount += food.points;
            return false; // Entferne Nahrung
        }
        return true; // Nahrung bleibt
    });
}


function generateMathFoodOptions(boundaries, playerState, spread = 50) {
    const correctResult = playerState.currentEquation.result;

    // Generiere Nahrung für die korrekte Antwort
    const correctFood = generateFood(
        {
            x: Math.random() * boundaries.width,
            y: Math.random() * boundaries.height,
        },
        50, // Punktewert
        {equation: playerState.currentEquation.equation, result: correctResult}
    );
    return correctFood;
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
    const food = generateFood(position, 50, {equation, result}); // Speichert Aufgabe und Lösung im meta-Feld
    if (food) gameState.food.push(food);
}


function generateMathEquation() {
    const num1 = randomizedNumber(1, 10);
    const num2 = randomizedNumber(1, 10);
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let equation = `${num1} ${operator} ${num2}`;
    let result;

    switch (operator) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
    }

    return {equation, result};
}

function assignNewMathEquation(playerState) {
    const {equation, result} = generateMathEquation();
    playerState.currentEquation = {equation, result};
}


function randomizedNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function dropSpecialFood(playerSnakeSegments, gameState) {
    if (!playerSnakeSegments || !gameState) return;
    const SPECIAL_FOOD_SPREAD = 10;

    playerSnakeSegments.forEach((segment, index) => {
        if (index % 9 === 0) {
            const randomOffsetX = Math.random() * SPECIAL_FOOD_SPREAD * 2 - SPECIAL_FOOD_SPREAD;
            const randomOffsetY = Math.random() * SPECIAL_FOOD_SPREAD * 2 - SPECIAL_FOOD_SPREAD;

            const food = generateFood(
                {x: segment.x + randomOffsetX, y: segment.y + randomOffsetY},
                9 // Fester Punktwert
            );
            if (food) gameState.food.push(food);
        }
    });
}


function checkPlayerCollisions(currentPlayer, players) {
    Object.values(players).forEach(otherPlayer => {
        if (currentPlayer.snakeId !== otherPlayer.snakeId) {
            if (currentPlayer.snake.checkCollisionWith(otherPlayer.snake)) {
                handlePlayerCollision(currentPlayer);
            }
        }
    });
}


// Kollisionsverarbeitung
function handlePlayerCollision(playerState) {
    const sessionId = playerState.sessionId;
    const gameState = gameStates.get(sessionId);
    const playerSnakeSegments = playerState.snake.segments;

    if (playerSnakeSegments && gameState) {
        // Spezialnahrung fallen lassen
        dropSpecialFood(playerSnakeSegments, gameState);
    }

    const ws = getWebSocketBySnakeId(playerState.snakeId);
    if (ws) {
        ws.send(JSON.stringify({type: 'game_over', score: playerState.score}));
    }
    console.log(`Collision: Player ${playerState.snakeId} eliminated`);
    removePlayerFromSession(ws);
}


async function removePlayerFromSession(ws) {
    const playerInfo = playerIndex.get(ws);
    if (!playerInfo) return;

    const {sessionId, snakeId, userId} = playerInfo;
    const gameState = gameStates.get(sessionId);
    const gameType = sessions.get(sessionId).gameType;
    const score = gameState.players[snakeId].score;

    const finalStats = {
        score: score,
        eatenFood: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
    }

    saveFinalScore(userId, gameType, finalStats).then(r => {
        console.log('Final score saved successfully', r);
    });


    if (gameState) {
        const playerState = gameState.players[snakeId];
        if (playerState) {
            delete gameState.players[snakeId];
        }

        // Entferne Session, wenn sie leer ist
        if (Object.keys(gameState.players).length === 0) {
            removeSession(sessionId);
        }
    }
    playerIndex.delete(ws);
}

function removeSession(sessionId) {
    gameStates.delete(sessionId);
    sessions.delete(sessionId);
    if (gameStates.size === 0) {
        setActiveSessions(false);
    }
}


// Funktion: Zufällige Position im Spielfeld generieren
function getRandomPosition(boundaries) {
    return {
        x: Math.floor(Math.random() * boundaries.width),
        y: Math.floor(Math.random() * boundaries.height),
    };
}


module.exports = {
    isSessionActive,
    createOrFindSession,
    addPlayerToSession,
    getAllSessions,
    broadcastGameState,
    updatePlayerMovement,
    handleMovement,
    movePlayers,
    gameStates,
    removePlayerFromSession,
};
