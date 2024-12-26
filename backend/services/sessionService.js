// services/sessionService.js
const {v4: uuidv4} = require('uuid');
const {equationManager} = require('../utils/mathEquations');
const WebSocket = require('ws');
const Snake = require('../classes/Snake');
const {saveFinalScore} = require("../models/ScoresModel");
const {getUsernameByUserId} = require("./userService");
// Managers
const FoodManager = require('../managers/foodManager');
const GameLoopManager = require('../managers/gameLoopManager');
const GameStateManager = require('../managers/gameStateManager');
const PlayerManager = require("../managers/playerManager");
const WebSocketManager = require('../managers/webSocketManager');

const playerManager = new PlayerManager();
const webSocketManager = new WebSocketManager();
const gameStateManager = new GameStateManager();
const gameLoopManager5000ms = new GameLoopManager(5000); // Erstelle eine Instanz mit dem gewünschten Intervall
const gameLoopManager50ms = new GameLoopManager(50);

const {GAME} = require('../config/gameConfig');

const {getRandomPosition, getRandomNumber, getRandomUsername} = require(
    '../utils/helperFunctions');

const sessions = new Map();
// const gameStates = new Map();
const playerIndex = new Map();

const GAMEBOUNDARIES = GAME.BOUNDARIES;
// const ZONE_COUNT = GAME.ZONE_COUNT; // Gittergröße 4x4

// Initialisiere Managers
const foodManager = new FoodManager();

let sessionActive = false;

const isSessionActive = () => sessionActive;

const setActiveSessions = (value) => {
  sessionActive = value;
};

// function createInitialGameState() {
//   const gameState = {
//     players: {},
//     food: [],
//     boundaries: GAMEBOUNDARIES,
//   };
//
//   generateRandomFood(gameState, (GAMEBOUNDARIES.width / 100));
//
//   return gameState;
// }

// function createInitialGameState() {
//   return gameStateManager.createInitialGameState();
// }

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

    // Starte MathFood-Loop
    gameLoopManager5000ms.addLoop(`mathFoods-${session.id}`, () => {
      if (isSessionActive()) {
        ensureMathFoods();
      }
    });
    gameLoopManager50ms.addLoop(`gameLoop-${session.id}`, () => {
      if (isSessionActive()) {
        movePlayers();
        broadcastGameState();
      }
    });

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

async function tryToGetUsername(userId) {
  if (!userId) {
    return getRandomUsername();
  } else {
    try {
      return await getUsernameByUserId(userId);
    } catch (e) {
      console.error('Error fetching user profile:', e);
    }
  }
}

async function addPlayerToSession(gameType, ws, fieldOfView, userId, clientId) {
  if (playerIndex.has(ws)) {
    await removePlayerFromSession(ws);
  }

  const session = await createOrFindSession(gameType);

  const username = await tryToGetUsername(userId);
  const snakeId = uuidv4();
  const startPosition = getRandomPosition(GAMEBOUNDARIES);
  const targetPosition = getRandomPosition(GAMEBOUNDARIES);
  const color = generateRandomColor();

  const playerSnake = new Snake(snakeId, startPosition, targetPosition, {
    name: username,
    color: color,
  });

  const playerState = playerManager.createPlayer(snakeId, session.id, userId,
      playerSnake, fieldOfView, 1, null, 0);


  const snake = playerState.snake;

  // Generiere und weise eine Aufgabe zu
  equationManager.addEquationsForSession(session.id, session.gameType, 5,
      playerState.level);
  equationManager.assignEquationToPlayer(session.id, snake, session.gameType);


  const gameState = gameStateManager.createOrFindGameState(session.id);
  gameState.players[snakeId] = playerState;

  // Spieler-Index aktualisieren
  playerIndex.set(ws, {sessionId: session.id, snakeId, userId});
  webSocketManager.addPlayer(clientId, ws);

  return {
    sessionId: session.id,
    snakeId,
    initialGameState: gameState,
  };
}

// function calculateZones(boundaries, zoneCount) {
//   const zoneWidth = boundaries.width / zoneCount;
//   const zoneHeight = boundaries.height / zoneCount;
//   const zones = [];
//
//   for (let x = 0; x < zoneCount; x++) {
//     for (let y = 0; y < zoneCount; y++) {
//       zones.push({
//         x: x * zoneWidth,
//         y: y * zoneHeight,
//         width: zoneWidth,
//         height: zoneHeight,
//         foodCount: 0, // Anzahl der Nahrungspunkte in der Zone
//       });
//     }
//   }
//
//   return zones;
// }

// function updateZoneFoodCounts(gameState, zones) {
//   // Zähler für jede Zone zurücksetzen
//   zones.forEach((zone) => zone.foodCount = 0);
//
//   // Nahrungspunkte jeder Zone zuordnen
//   gameState.food.forEach((food) => {
//     const zone = zones.find(
//         (z) =>
//             food.x >= z.x &&
//             food.x < z.x + z.width &&
//             food.y >= z.y &&
//             food.y < z.y + z.height
//     );
//
//     if (zone) {
//       zone.foodCount++;
//     }
//   });
// }

function ensureMathFoods() {
  if (!isSessionActive()) {
    console.log('No active sessions. Skipping MathFoods check.');
    return;
  }

  const gameStates = gameStateManager.getGameStates();

  gameStates.forEach((gameState, sessionId) => {
    const players = gameState.players;
    foodManager.ensureMathFoodForPlayers(gameState, players);
    console.log(`MathFoods ensured for session: ${sessionId}`);
  });
}

// function replenishFoodInZones(gameState, zones) {
//   foodManager.replenishFoodInZones(gameState, zones);
// }

function getAllSessions() {
  return sessions;
}

function broadcastGameState() {
  const gameStates = gameStateManager.getGameStates();
  gameStates.forEach((gameState) => {
    const {players, food} = gameState;

    // Iteriere durch alle Spieler in der Sitzung
    Object.values(players).forEach((player) => {
      const nearbyPlayers = getNearbyPlayers(player, players); // Spieler im Umkreis von 200px

      // Erstelle die Nachricht mit relevanten Daten
      const message = JSON.stringify({
        type: 'session_broadcast',
        players: nearbyPlayers.map(
            ({snakeId, headPosition, segments, currentEquation, score}) => ({
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
      const dx = player.snake.headPosition.x
          - currentPlayer.snake.headPosition.x;
      const dy = player.snake.headPosition.y
          - currentPlayer.snake.headPosition.y;

      // Prüfe, ob der Spieler innerhalb des Bereichs liegt
      if (Math.sqrt(dx * dx + dy * dy) <= currentPlayer.fieldOfView) {
        nearbyPlayers.push(player.snake);
      }
    }
  });

  return nearbyPlayers;
}

// function broadcastGameStateWithDeltas() {
//   gameStates.forEach((gameState, sessionId) => {
//     const {players, boundaries} = gameState;
//
//     Object.values(players).forEach((player) => {
//       const nearbyPlayers = getNearbyPlayers(player, players, boundaries);
//
//       // Erstelle das aktuelle Delta
//       const currentState = nearbyPlayers.map(
//           ({snakeId, headPosition, segments}) => ({
//             snakeId,
//             headPosition,
//             segmentCount: segments.length,
//           }));
//
//       const lastState = lastSentStates.get(player.snakeId) || [];
//       const delta = calculateDelta(lastState, currentState);
//
//       // Speichere den aktuellen Zustand
//       lastSentStates.set(player.snakeId, currentState);
//
//       // Sende nur, wenn es Änderungen gibt
//       if (delta.length > 0 && player.ws.readyState === WebSocket.OPEN) {
//         player.ws.send(
//             JSON.stringify({type: 'game_state_update', updates: delta}));
//       }
//
//       // Abrufen des WebSocket für den aktuellen Spieler
//       const ws = getWebSocketBySnakeId(player.snakeId);
//
//       if (ws && ws.readyState === WebSocket.OPEN) {
//         ws.send(message); // Nachricht an den Spieler senden
//       }
//     });
//   });
// }

// // Hilfsfunktion: Delta berechnen
// function calculateDelta(lastState, currentState) {
//   const delta = [];
//
//   currentState.forEach((current) => {
//     const last = lastState.find((p) => p.snakeId === current.snakeId);
//     if (!last || JSON.stringify(last) !== JSON.stringify(current)) {
//       delta.push(current);
//     }
//   });
//
//   return delta;
// }

async function updatePlayerMovement(data, ws) {
  const {targetX, targetY, boost} = data;

  const playerInfo = playerIndex.get(ws);
  if (!playerInfo) {
    throw new Error('Player not found for WebSocket');
  }

  const {sessionId, snakeId} = playerInfo;
  const gameState = gameStateManager.getGameStateBySessionId(sessionId);
  // onst gameState = gameStates.get(sessionId);
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

// function handleMovement(data, ws) {
//   const {targetX, targetY, boost} = data;
//
//   if (isNaN(targetX) || isNaN(targetY)) {
//     throw new Error('Invalid target coordinates');
//   }
//
//   // Spielerinformationen über den Index finden
//   const playerInfo = playerIndex.get(ws);
//   if (!playerInfo) {
//     throw new Error('Player not found for WebSocket');
//   }
//
//   const {sessionId, snakeId} = playerInfo;
//   const gameState = gameStateManager.getGameStateBySessionId(sessionId);
//   // const gameState = gameStates.get(sessionId);
//   if (!gameState) {
//     console.error(`GameState not found for sessionId: ${sessionId}`);
//     return;
//   }
//
//   const player = gameState.players[snakeId];
//   if (!player) {
//     console.error(`Player not found in GameState for snakeId: ${snakeId}`);
//     return;
//   }
//
//   // Zielposition aktualisieren
//   if (targetX !== undefined && targetY !== undefined) {
//     player.snake.updateDirection(targetX, targetY);
//   }
//
//   // Boost nur aktivieren, wenn Punkte > 0 sind
//   // Update boost state only if the player has enough score
//   if (boost && player.score > 0) {
//     player.snake.setBoost(true);
//   } else {
//     player.snake.setBoost(false);
//   }
// }

function movePlayers() {
  const gameStates = gameStateManager.getGameStates();
  gameStates.forEach((gameState, sessionId) => {
    const {players, boundaries} = gameState;

    // ensureMathFoods();

    // // Zonen berechnen und Nahrung zählen
    // const zones = calculateZones(boundaries, ZONE_COUNT);
    // updateZoneFoodCounts(gameState, zones);
    //
    // // Nahrung in unterversorgten Zonen ergänzen
    // replenishFoodInZones(gameState, zones);

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
      const randomOffsetX = Math.random() * TAIL_DROP_SPREAD * 2
          - TAIL_DROP_SPREAD;
      const randomOffsetY = Math.random() * TAIL_DROP_SPREAD * 2
          - TAIL_DROP_SPREAD;

      const food = generateFood(
          {x: tailSegment.x + randomOffsetX, y: tailSegment.y + randomOffsetY},
          POINT_LOSS
      );
      if (food) {
        gameState.food.push(food);
      }
    }
  }
}

function handleFoodCollision(playerState, gameState) {
  foodManager.handleFoodCollision(playerState, gameState, equationManager);
}

// function generateMathFoodOptions(boundaries, result, points = 50) {
//   // Generiere Nahrung für die korrekte Antwort
//   return generateFood(
//       getRandomPosition(boundaries),
//       50, // Punktewert
//       {result: result}
//   );
// }

function generateFood(position, points, meta = null) {
  if (!position || points < 1 || isNaN(position.x) || isNaN(position.y)
      || isNaN(points)) {
    return null;
  }

  return {
    x: position.x,
    y: position.y,
    points,
    meta, // Optional: Zusätzliche Informationen (z. B. Mathematikaufgabe)
  };
}

// function generateRandomFood(gameState, count = 5) {
//   const newFood = foodManager.generateRandomFood(count);
//   gameState.food.push(...newFood);
// }

// function generateMathFood(gameState, equation, result, spread = 50) {
//   const position = {
//     x: Math.random() * gameState.boundaries.width,
//     y: Math.random() * gameState.boundaries.height,
//   };
//   const food = generateFood(position, 50, {equation, result}); // Speichert Aufgabe und Lösung im meta-Feld
//   if (food) {
//     gameState.food.push(food);
//   }
// }

// function generateMathEquation() {
//   const num1 = getRandomNumber(1, 10);
//   const num2 = getRandomNumber(1, 10);
//   const operators = ['+', '-', '*'];
//   const operator = operators[Math.floor(Math.random() * operators.length)];
//
//   let equation = `${num1} ${operator} ${num2}`;
//   let result;
//
//   switch (operator) {
//     case '+':
//       result = num1 + num2;
//       break;
//     case '-':
//       result = num1 - num2;
//       break;
//     case '*':
//       result = num1 * num2;
//       break;
//   }
//
//   return {equation, result};
// }

function dropSpecialFood(playerSnakeSegments, gameState) {
  foodManager.dropSpecialFood(playerSnakeSegments, gameState);
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
  const gameState = gameStateManager.getGameStateBySessionId(sessionId);
  // const gameState = gameStates.get(sessionId);
  const playerSnakeSegments = playerState.snake.segments;

  if (playerSnakeSegments && gameState) {
    // Spezialnahrung fallen lassen
    dropSpecialFood(playerSnakeSegments, gameState);
  }

  const ws = getWebSocketBySnakeId(playerState.snakeId);
  if (ws) {
    ws.send(JSON.stringify({type: 'game_over', score: playerState.score}));
  }

  removePlayerFromSession(ws).then(
      () => {
        console.log('Player removed after collision');
      }
  ).catch(e => {
    console.error('Error removing player after collision:', e);
  });
}

async function removePlayerFromSession(ws) {
  const playerInfo = playerIndex.get(ws);
  if (!playerInfo) {
    throw new Error('Player not found for WebSocket');
  }

  const {sessionId, snakeId, userId} = playerInfo;
  const gameState = gameStateManager.getGameStateBySessionId(sessionId);
  // const gameState = gameStates.get(sessionId);
  const gameType = sessions.get(sessionId).gameType;
  const score = gameState.players[snakeId].score;

  const finalStats = {
    userId,
    gameType,
    score: score,
    eatenFood: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    playedAt: Date.now()
  }

  saveFinalScore(userId, gameType, finalStats).then(r => {
    console.log('Final score saved successfully')
  }).catch(e => {
    console.error('Error saving final score:', e);
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
  gameStateManager.removeGameState(sessionId);
  // gameStates.delete(sessionId);
  sessions.delete(sessionId);
  gameLoopManager50ms.removeLoop(`gameLoop-${sessionId}`);
  gameLoopManager5000ms.removeLoop(`mathFoods-${sessionId}`);
  const gameStates = gameStateManager.getGameStates();
  if (gameStates.size === 0) {
    setActiveSessions(false);
  }
}

process.on('SIGINT', () => {
  gameLoopManager50ms.clearAllLoops();
  gameLoopManager5000ms.clearAllLoops();
  console.log('All loops cleared. Server shutting down...');
  process.exit();
});

module.exports = {
  isSessionActive,
  addPlayerToSession,
  getAllSessions,
  broadcastGameState,
  updatePlayerMovement,
  removePlayerFromSession,
};
