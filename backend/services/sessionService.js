// services/sessionService.js
const {v4: uuidv4} = require('uuid');
const {equationManager} = require('../utils/mathEquations');

// const WebSocket = require('ws');
const Snake = require('../classes/Snake');
const {saveFinalScore} = require("../models/ScoresModel");
const {getUsernameByUserId} = require("./userService");

// Managers
const FoodManager = require('../managers/foodManager');
const GameLoopManager = require('../managers/gameLoopManager');
const GameStateManager = require('../managers/gameStateManager');
const PlayerManager = require("../managers/playerManager");
const WebSocketManager = require('../managers/webSocketManager');
const SessionManager = require('../managers/sessionManager');

// Instances
const foodManager = new FoodManager();
const gameLoopManager5000ms = new GameLoopManager(5000); // Erstelle eine Instanz mit dem gewünschten Intervall
const gameLoopManager50ms = new GameLoopManager(50);
const gameStateManager = new GameStateManager();
const playerManager = new PlayerManager();
const webSocketManager = new WebSocketManager();
const sessionManager = new SessionManager();

// Config
const {GAME} = require('../config/gameConfig');

// Utils
const {getRandomPosition, getRandomNumber, getRandomUsername, getRandomColor} = require(
    '../utils/helperFunctions');


const GAMEBOUNDARIES = GAME.BOUNDARIES;



function createSession(gameType) {
  const session = sessionManager.createSession(gameType);
  const sessionId = session.id;

  equationManager.initializeEquationsForSession(sessionId, gameType);

  // Starte MathFood-Loop
  gameLoopManager5000ms.addLoop(`mathFoods-${sessionId}`, () => {
    if (sessionManager.isSessionActive()) {
      ensureMathFoods();
    }
  });
  gameLoopManager50ms.addLoop(`gameLoop-${sessionId}`, () => {
    if (sessionManager.isSessionActive()) {
      movePlayers();
      broadcastGameState();
    }
  });

  sessionManager.setActiveSessions(true);

  return session;
}


async function createOrFindSession(gameType) {
  let session = sessionManager.findSessionByGameType(gameType);

  if (!session) {
    session = sessionManager.createSession(gameType);
  }
  return session;
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

async function addPlayerToSession(clientId, gameType, ws, fieldOfView, userId) {
  const player = playerManager.getPlayerByClientId(clientId);
  if (player) {
    playerManager.removePlayerByClientId(clientId);
  }

  const session = await createOrFindSession(gameType);
  const sessionId = session.id;

  const username = await tryToGetUsername(userId);
  const snakeId = uuidv4();
  const startPosition = getRandomPosition(GAMEBOUNDARIES);
  const targetPosition = getRandomPosition(GAMEBOUNDARIES);
  const color = getRandomColor();

  const playerSnake = new Snake(snakeId, startPosition, targetPosition, {
    name: username,
    color: color,
  });

  const playerState = playerManager.createPlayer(clientId, snakeId, sessionId, userId,
      playerSnake, fieldOfView, 1);


  const snake = playerState.snake;

  // Generiere und weise eine Aufgabe zu
  equationManager.addEquationsForSession(sessionId, session.gameType, 5,
      playerState.level);
  equationManager.assignEquationToPlayer(sessionId, snake, session.gameType);


  const gameState = gameStateManager.createOrFindGameState(sessionId);
  gameState.players[snakeId] = playerState;

  // Spieler-Index aktualisieren
  playerManager.addPlayer(clientId, playerState);
  webSocketManager.addClient(clientId, ws);

  return {
    sessionId,
    snakeId,
    initialGameState: gameState,
  };
}

function ensureMathFoods() {
  if (!sessionManager.isSessionActive()) {
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

function getAllSessions() {
  return sessionManager.getAllSessions();
}

function broadcastGameState() {
  const gameStates = gameStateManager.getGameStates();
  gameStates.forEach((gameState) => {
    webSocketManager.sendGameStateToPlayers(gameState);
  });
}

async function updatePlayerMovement(snakeId, targetX, targetY, boost) {

  const playerInfo = playerManager.getPlayerBySnakeId(snakeId);
  if (!playerInfo) {
    throw new Error('Player not found for snakeId');
  }

  const {sessionId} = playerInfo;
  const gameState = gameStateManager.getGameStateBySessionId(sessionId);
  // onst gameState = gameStates.get(sessionId);
  if (!gameState) {
    throw new Error(`Game state not found for session ID: ${sessionId}`);
  }

  const player = gameState.players[snakeId];
  if (!player) {
    throw new Error(`Player not found in game state for snake ID: ${snakeId}`);
  }

  const snake = gameState.players[snakeId].snake;
  if (!snake) {
    throw new Error(`Snake not found in player for snake ID: ${snakeId}`);
  }

  // Update player movement
  if (targetX !== undefined && targetY !== undefined) {
    snake.updateDirection(targetX, targetY);
  }

  // Update boost state only if the player has enough score
  if (boost && snake.score > 0) {
    snake.setBoost(true);
  } else {
    snake.setBoost(false);
  }
}


function movePlayers() {
  const gameStates = gameStateManager.getGameStates();
  gameStates.forEach((gameState, sessionId) => {
    const {players, boundaries} = gameState;

    // Bewegung und Nahrungskollisionen für alle Spieler verarbeiten
    Object.values(players).forEach((playerState) => {
      playerManager.movePlayer(playerState, boundaries);
      foodManager.handleFoodCollision(playerState, gameState, equationManager);
      handleBoostPenalty(playerState, gameState);
    });

    // Kollisionserkennung
    Object.values(players).forEach((playerState) => {
      checkPlayerCollisions(playerState, players);
    });
  });
}

// function movePlayer(playerState, boundaries) {
//   playerState.snake.moveSnake(boundaries);
// }


function handleBoostPenalty(playerState, gameState) {
  const {snake} = playerState;
  if (snake.boost) {
    // Score sicherstellen, dass er nicht negativ wird
    if (snake.score <= 0) {
      snake.score = 0; // Sicherstellen, dass der Score nicht negativ ist
      snake.setBoost(false); // Boost deaktivieren
      return; // Keine weiteren Aktionen durchführen
    }

    const POINT_LOSS = 1; // Punkteverlust pro Boost-Zyklus
    const TAIL_DROP_SPREAD = 20; // Versatz um das Schwanzsegment

    // Punkteabzug
    // playerState.score -= POINT_LOSS;
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

// function handleFoodCollision(playerState, gameState) {
//   foodManager.handleFoodCollision(playerState, gameState, equationManager);
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

// function dropSpecialFood(playerSnakeSegments, gameState) {
//   foodManager.dropSpecialFood(playerSnakeSegments, gameState);
// }

function checkPlayerCollisions(currentPlayer, players) {
  Object.values(players).forEach(otherPlayer => {
    if (currentPlayer.snakeId !== otherPlayer.snakeId) {
      if (currentPlayer.snake.checkCollisionWith(otherPlayer.snake)) {
        playerManager.handlePlayerCollision(currentPlayer, webSocketManager, foodManager, gameStateManager, removePlayerFromSession);
      }
    }
  });
}


// // Kollisionsverarbeitung
// function handlePlayerCollision(playerState) {
//   const {sessionId, clientId} = playerState;
//   const gameState = gameStateManager.getGameStateBySessionId(sessionId);
//   const playerSnakeSegments = playerState.snake.segments;
//
//   if (playerSnakeSegments && gameState) {
//     // Spezialnahrung fallen lassen
//     foodManager.dropSpecialFood(playerSnakeSegments, gameState);
//   }
//
//   const message = JSON.stringify({type: 'game_over', score: playerState.snake.score});
//
//   webSocketManager.sendMessageToPlayerByClientId(clientId, message);
//   removePlayerFromSession(clientId).then(
//       () => {
//         console.log('Player removed after collision');
//       }
//   ).catch(e => {
//     console.error('Error removing player after collision:', e);
//   });
// }

async function removePlayerFromSession(clientId) {
  const playerInfo = playerManager.getPlayerByClientId(clientId)
  if (!playerInfo) {
    throw new Error('Player not found for WebSocket');
  }

  const {sessionId, snakeId, userId} = playerInfo;
  const gameState = gameStateManager.getGameStateBySessionId(sessionId);
  const snake = gameState.players[snakeId].snake;
  const session = sessionManager.getSessionById(sessionId);
  const gameType = session.gameType;
  const score = snake.score;

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
  playerManager.removePlayerByClientId(clientId);
}

function removeSession(sessionId) {
  gameStateManager.removeGameState(sessionId);
  // gameStates.delete(sessionId);
  sessionManager.removeSession(sessionId);
  gameLoopManager50ms.removeLoop(`gameLoop-${sessionId}`);
  gameLoopManager5000ms.removeLoop(`mathFoods-${sessionId}`);
  const gameStates = gameStateManager.getGameStates();
  if (gameStates.size === 0) {
    sessionManager.setActiveSessions(false);
  }
}

process.on('SIGINT', () => {
  gameLoopManager50ms.clearAllLoops();
  gameLoopManager5000ms.clearAllLoops();
  console.log('All loops cleared. Server shutting down...');
  process.exit();
});

module.exports = {
  addPlayerToSession,
  getAllSessions,
  broadcastGameState,
  updatePlayerMovement,
  removePlayerFromSession,
};
