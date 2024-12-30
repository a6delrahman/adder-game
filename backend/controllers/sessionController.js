// controllers/sessionController.js
const {v4: uuidv4} = require('uuid');
const {equationManager} = require('../utils/mathEquations');
const Snake = require('../classes/Snake');
const {saveFinalScore} = require("../models/ScoresModel");
const {tryToGetUsername} = require("../services/userService");
// Utils
const {getRandomPosition, getRandomColor} = require('../utils/helperFunctions');
const safeExecute = require('../middleware/safeExecute');

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
const webSocketManager = WebSocketManager.getInstance();
const sessionManager = new SessionManager();

// Config
const {GAME} = require('../config/gameConfig');

const GAMEBOUNDARIES = GAME.BOUNDARIES;
const POINT_LOSS = GAME.POINT_LOSS;
const Boost_TAIL_DROP_SPREAD = GAME.Boost_TAIL_DROP_SPREAD;

function createSession(gameType) {
  const session = sessionManager.createSession(gameType);
  const sessionId = session.id;

  equationManager.initializeEquationsForSession(sessionId, gameType);

  // Starte MathFood-Loop
  gameLoopManager5000ms.addLoop(`mathFoods-${sessionId}`, () => {
    ensureMathFoods();
  });
  gameLoopManager50ms.addLoop(`gameLoop-${sessionId}`, () => {
    movePlayers();
    broadcastGameState();
  });

  sessionManager.setActiveSessions(true);

  return session;
}

async function createOrFindSession(gameType) {
  let session = sessionManager.findSessionByGameType(gameType);

  if (!session) {
    session = createSession(gameType);
  }
  return session;
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

  const playerState = playerManager.createPlayer(clientId, snakeId, sessionId,
      userId,
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
  // webSocketManager.addClient(clientId, ws);
  // webSocketManager.addClientToSession(sessionId, clientId);

  return {
    sessionId,
    snakeId,
    initialGameState: gameState,
  };
}

function sendMessageToPlayerByClientId(clientId, type, payload) {
  webSocketManager.sendMessageToPlayerByClientId(clientId, type, payload);
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

// function broadcastGameState() {
//   const gameStates = gameStateManager.getGameStates();
//   gameStates.forEach((gameState) => {
//     webSocketManager.sendGameStateToPlayers(gameState);
//   });
// }

function broadcastGameState() {
  const gameStates = gameStateManager.getGameStates();

  gameStates.forEach((gameState, sessionId) => {
    const batchUpdate = {
      type: 'session_broadcast',
      players: [],
      food: gameState.food,
      timestamp: Date.now()
    };

    // Spielstatus aller Spieler sammeln
    Object.values(gameState.players).forEach((playerState) => {
      batchUpdate.players.push({
        snakeId: playerState.snake.snakeId,
        headPosition: playerState.snake.headPosition,
        segments: playerState.snake.segments,
        currentEquation: playerState.snake.currentEquation,
        score: playerState.snake.score,
      });
    });

    // Sende das Batch-Update an alle Clients in der Session
    webSocketManager.broadcastToSession(sessionId, batchUpdate);
  });
}

async function updatePlayerMovement(snakeId, direction, boost) {

  const playerInfo = playerManager.getPlayerBySnakeId(snakeId);
  if (!playerInfo) {
    throw new Error('Player not found for snakeId');
  }

  const {sessionId} = playerInfo;
  const gameState = gameStateManager.getGameStateBySessionId(sessionId);

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
  if (direction !== undefined) {
    snake.updateDirection(direction);
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
      foodManager.handleFoodCollision(playerState, gameState, equationManager, sendMessageToPlayerByClientId);
      handleBoostPenalty(playerState, gameState);
    });

    // Kollisionserkennung
    Object.values(players).forEach((playerState) => {
      checkPlayerCollisions(playerState, players);
    });
  });
}

function handleBoostPenalty(playerState, gameState) {
  const {snake} = playerState;
  if (snake.boost) {
    // Score sicherstellen, dass er nicht negativ wird
    if (snake.score <= 0) {
      snake.score = 0; // Sicherstellen, dass der Score nicht negativ ist
      snake.setBoost(false); // Boost deaktivieren
      return; // Keine weiteren Aktionen durchführen
    }

    // Punkteabzug
    snake.score -= POINT_LOSS;
    snake.segmentCount -= POINT_LOSS;

    // Schwanzsegment entfernen
    const tailSegment = snake.segments.pop();

    // Nahrung fallen lassen
    if (tailSegment) {
      const randomOffsetX = Math.random() * Boost_TAIL_DROP_SPREAD * 2
          - Boost_TAIL_DROP_SPREAD;
      const randomOffsetY = Math.random() * Boost_TAIL_DROP_SPREAD * 2
          - Boost_TAIL_DROP_SPREAD;

      const food = foodManager.generateFood(
          {x: tailSegment.x + randomOffsetX, y: tailSegment.y + randomOffsetY},
          POINT_LOSS
      );
      if (food) {
        gameState.food.push(food);
      }
    }
  }
}

function checkPlayerCollisions(currentPlayer, players) {
  Object.values(players).forEach(otherPlayer => {
    if (currentPlayer.snakeId !== otherPlayer.snakeId) {
      if (currentPlayer.snake.checkCollisionWith(otherPlayer.snake)) {
        playerManager.handlePlayerCollision(currentPlayer, webSocketManager,
            foodManager, gameStateManager, removePlayerFromSession);
      }
    }
  });
}

async function removePlayerFromSession(clientId) {
  const playerInfo = playerManager.getPlayerByClientId(clientId)
  if (!playerInfo) {
    throw new Error('Player not found for clientIdv');
  }
  const {sessionId, snakeId} = playerInfo;
  const gameState = gameStateManager.getGameStateBySessionId(sessionId);

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

async function getFinalStats(clientId) {
  const playerInfo = playerManager.getPlayerByClientId(clientId)
  if (!playerInfo) {
    throw new Error('Player not found for clientId');
  }
  const {sessionId, snakeId, userId} = playerInfo;
  const gameState = gameStateManager.getGameStateBySessionId(sessionId);
  const gameType = sessionManager.getSessionById(sessionId).gameType;
  const snake = gameState.players[snakeId].snake;

  return {
    userId,
    gameType,
    score: snake.score,
    eatenFood: snake.eatenFood,
    correctAnswers: snake.correctAnswers,
    wrongAnswers: snake.wrongAnswers,
    playedAt: Date.now()
  }
}

async function saveFinalStats(clientId) {
  const player = playerManager.getPlayerByClientId(clientId);
  if (!player.userId) {
    console.log('unregistered Playerstats are not saved');
    return;
  }
  const finalStats = await getFinalStats(clientId);

  await safeExecute(saveFinalScore, finalStats);
}

function removeSession(sessionId) {
  gameStateManager.removeGameState(sessionId);
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
  saveFinalStats,
};
