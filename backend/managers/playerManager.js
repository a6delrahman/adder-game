const {v4: uuidv4} = require("uuid");
const {getRandomPosition} = require("../utils/helperFunctions");
const Snake = require("../classes/Snake");

class PlayerManager {
  constructor() {
    this.playerIndex = new Map();
  }


  addPlayer(clientId, player) {
    this.playerIndex.set(clientId, player);
  }

  removePlayer(clientId) {
    this.playerIndex.delete(clientId);
  }

  getPlayer(clientId) {
    return this.playerIndex.get(clientId);
  }

  getPlayers() {
    return Array.from(this.playerIndex.values());
  }

  getPlayersInSession(sessionId) {
    return this.getPlayers().filter(player => player.sessionId === sessionId);
  }

  createPlayer(snakeId, sessionId, userId, playerSnake, fieldOfView, level) {
    return {
      snakeId,
      sessionId,
      userId,
      snake: playerSnake,
      boost: false,
      fieldOfView,
      level: level || 1,
      currentEquation: null,
      score: 0,
    };
  }






}

module.exports = PlayerManager;