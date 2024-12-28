// managers/foodManager.js
const { GAME } = require('../config/gameConfig');
const { getRandomPosition } = require('../utils/helperFunctions');
const WebSocketManager = require('./webSocketManager');
const webSocketManager = WebSocketManager.getInstance();

class FoodManager {
  constructor() {
    this.boundaries = GAME.BOUNDARIES;
    this.minFoodPerZone = GAME.MIN_FOOD_PER_ZONE;
    this.maxFoodPerZone = GAME.MAX_FOOD_PER_ZONE;
    this.specialFoodSpread = GAME.SPECIAL_FOOD_SPREAD
  }

  generateFood(position, points, meta = null) {
    if (!position || points < 1) {
      console.warn('Invalid food generation parameters:', position, points);
      return null;
    }

    return { ...position, points, meta };
  }

  generateInitialFood() {
    const food = [];
    const zones = this.calculateZones(this.boundaries);
    const totalFoodCount = Math.floor((this.boundaries.width * this.boundaries.height) / 5_000);
    const mathFoodCount = Math.floor(totalFoodCount / 2);
    const normalFoodCount = totalFoodCount - mathFoodCount;

    // Generate normal food
    food.push(...this.generateRandomFood(normalFoodCount));

    // Generate math food with results 1-20
    for (let i = 1; i <= mathFoodCount; i++) {
      const zone = zones[i % zones.length];
      const result = i % 20 + 1;
      const foodPosition = {
        x: Math.random() * zone.width + zone.x,
        y: Math.random() * zone.height + zone.y,
      };
      const mathFood = this.generateFood(foodPosition, 50, { result: result });
      if (mathFood) {
        food.push(mathFood);
      }
    }

    return food;
  }

  generateRandomFood(count) {
    return Array.from({ length: count }).map(() => {
      const position = getRandomPosition(this.boundaries);
      const points = Math.floor(Math.random() * 5) + 1; // Zufällige Punkte zwischen 1 und 5
      return this.generateFood(position, points);
    }).filter(food => food !== null);
  }

  replenishFoodInZones(gameState, zones) {
    zones.forEach(zone => this.replenishZone(zone, gameState));
  }

  replenishZone(zone, gameState) {
    if (zone.foodCount < this.minFoodPerZone) {
      const missingFood = this.maxFoodPerZone - zone.foodCount;

      for (let i = 0; i < missingFood; i++) {
        const foodPosition = {
          x: Math.random() * zone.width + zone.x,
          y: Math.random() * zone.height + zone.y,
        };

        const food = this.generateFood(foodPosition, Math.floor(Math.random() * 5) + 1);
        if (food) {
          gameState.food.push(food);
        }
      }
    }
  }

  ensureMathFoodForPlayers(gameState, players) {
    const zones = this.calculateZones(this.boundaries); // Beispiel: 10 Zonen

    const playerEquations = Object.values(players).reduce((acc, player) => {
      if (player.snake.currentEquation) {
        acc[player.snake.currentEquation.result] = true;
      }
      return acc;
    }, {});

    zones.forEach(zone => {
      const existingMathFoodResults = gameState.food.reduce((acc, food) => {
        if (food.meta?.result !== undefined && this.isFoodInZone(food, zone)) {
          acc[food.meta.result] = true;
        }
        return acc;
      }, {});

      Object.keys(playerEquations).forEach(result => {
        if (!existingMathFoodResults[result]) {
          const foodPosition = {
            x: Math.random() * zone.width + zone.x,
            y: Math.random() * zone.height + zone.y,
          };
          const mathFood = this.generateFood(foodPosition, 50, { result: Number(result) });
          if (mathFood) {
            gameState.food.push(mathFood);
          }
        }
      });
    });
  }

  calculateZones(boundaries) {
    const zoneCount = Math.floor(boundaries.width / 300);
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
        });
      }
    }

    return zones;
  }

  isFoodInZone(food, zone) {
    return (
        food.x >= zone.x &&
        food.x < zone.x + zone.width &&
        food.y >= zone.y &&
        food.y < zone.y + zone.height
    );
  }

  dropSpecialFood(playerSnakeSegments, gameState) {
    if (!playerSnakeSegments || !gameState) {
      return;
    }

    playerSnakeSegments.forEach((segment, index) => {
      if (index % 18 === 0) {
        const randomOffsetX = Math.random() * this.specialFoodSpread * 2 - this.specialFoodSpread;
        const randomOffsetY = Math.random() * this.specialFoodSpread * 2 - this.specialFoodSpread;

        const food = this.generateFood(
            { x: segment.x + randomOffsetX, y: segment.y + randomOffsetY },
            9 // Fester Punktwert
        );
        if (food) {
          gameState.food.push(food);
        }
      }
    });
  }

  handleFoodCollision(playerState, gameState, equationManager) {
    const { snake } = playerState;

    gameState.food = gameState.food.filter(food => {
      if (snake.checkCollisionWithFood(food)) {
        snake.foodEaten();
        this.processFoodCollision(playerState, snake, gameState, food, equationManager);
        return false; // Entferne konsumierte Nahrung
      }
      return true; // Nahrung bleibt bestehen
    });
  }

  processFoodCollision(playerState, snake, gameState, food, equationManager) {
    webSocketManager.sendMessageToPlayerByClientId(playerState.clientId, 'play_collect', {});
    if (food.meta?.result !== undefined) {
      this.handleMathFoodCollision(playerState, snake, food, equationManager);
    } else {
      this.handleNormalFoodCollision(playerState, snake, food);
    }
  }

  handleMathFoodCollision(playerState, snake, food, equationManager) {
    const correctResult = snake.currentEquation?.result;
    if (food.meta.result === correctResult) {
      this.updateScoresAndSegments(playerState, snake, food.points);
      snake.correctAnswer();
      webSocketManager.sendMessageToPlayerByClientId(playerState.clientId, 'correct_answer', {});
      equationManager.assignEquationToPlayer(
          playerState.sessionId,
          snake,
          snake.currentEquation.type
      );
    } else {
      this.updateScoresAndSegments(playerState, snake, -food.points);
      snake.wrongAnswer();
      webSocketManager.sendMessageToPlayerByClientId(playerState.clientId, 'wrong_answer', {});
    }
  }

  handleNormalFoodCollision(playerState, snake, food) {
    this.updateScoresAndSegments(playerState, snake, food.points);
  }

  updateScoresAndSegments(playerState, snake, points) {
    playerState.score = Math.max(0, playerState.score + points);
    snake.score = Math.max(0, snake.score + points);
    snake.segmentCount = Math.max(snake.SNAKE_INITIAL_LENGTH, snake.segmentCount + points);
  }
}

module.exports = FoodManager;
