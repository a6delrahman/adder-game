// const { calculateZones, updateZoneFoodCounts } = require('../utils/helperFunctions');
const {GAME} = require('../config/gameConfig');
const FoodManager = require('../managers/foodManager');
const {equationManager} = require("../utils/mathEquations");

class GameStateManager {
  constructor() {
    this.boundaries = GAME.BOUNDARIES;
    this.foodManager = new FoodManager();
    this.gameStates = new Map();
  }

  getGameStateBySessionId(sessionId) {
    return this.gameStates.get(sessionId);
  }

  createInitialGameState() {
    const food = this.foodManager.generateInitialFood();
    return {
      players: {},
      food: food,
      boundaries: this.boundaries,
    };
  }

  createOrFindGameState(sessionId) {
    if (!this.gameStates.has(sessionId)) {
      this.gameStates.set(sessionId, this.createInitialGameState());
      // this.gameStates.get(sessionId).sessionId = sessionId;
    }
    return this.gameStates.get(sessionId);
  }

  getGameStates() {
    return this.gameStates;
  }

  removeGameState(sessionId) {
    this.gameStates.delete(sessionId);
  }
}

module.exports = GameStateManager;
