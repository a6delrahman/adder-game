const {v4: uuidv4} = require("uuid");
const {getRandomPosition} = require("../utils/helperFunctions");
const Snake = require("../classes/Snake");
const {equationManager} = require("../utils/mathEquations");

class PlayerManager {
  constructor() {
    this.playerIndex = new Map();
  }

  addPlayer(clientId, player) {
    this.playerIndex.set(clientId, player);
  }

  removePlayerByClientId(clientId) {
    this.playerIndex.delete(clientId);
  }

  getPlayerByClientId(clientId) {
    return this.playerIndex.get(clientId);
  }

  getPlayers() {
    return Array.from(this.playerIndex.values());
  }

  getPlayersInSession(sessionId) {
    return this.getPlayers().filter(player => player.sessionId === sessionId);
  }



  // Kollisionsverarbeitung
  handlePlayerCollision(playerState, webSocketManager, foodManager, gameStateManager, removePlayerFromSession) {
    const {sessionId, clientId} = playerState;
    const gameState = gameStateManager.getGameStateBySessionId(sessionId);
    const playerSnakeSegments = playerState.snake.segments;

    if (playerSnakeSegments && gameState) {
      // Spezialnahrung fallen lassen
      foodManager.dropSpecialFood(playerSnakeSegments, gameState);
    }

    const type = 'game_over';
    const payload = {score: playerState.snake.score};

    webSocketManager.sendMessageToPlayerByClientId(clientId, type, payload);
    removePlayerFromSession(clientId).then(
        () => {
          console.log('Player removed after collision');
        }
    ).catch(e => {
      console.error('Error removing player after collision:', e);
    });
  }



  movePlayer(playerState, boundaries) {
    playerState.snake.moveSnake(boundaries);
  }

  getPlayerBySnakeId(snakeId) {
    return this.getPlayers().find(player => player.snakeId === snakeId);
  }

  createPlayer(clientId, snakeId, sessionId, userId, playerSnake, fieldOfView, level) {
    return {
      clientId,
      snakeId,
      sessionId,
      userId,
      snake: playerSnake,
      fieldOfView,
      level: level || 1,
    };
  }






}

module.exports = PlayerManager;