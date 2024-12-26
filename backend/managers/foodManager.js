// managers/foodManager.js

const { getRandomPosition } = require('../utils/positionHelper');

class FoodManager {
  constructor(boundaries, minFoodPerZone, maxFoodPerZone) {
    this.boundaries = boundaries;
    this.minFoodPerZone = minFoodPerZone;
    this.maxFoodPerZone = maxFoodPerZone;
  }

  generateFood(position, points, meta = null) {
    if (!position || points < 1 || isNaN(position.x) || isNaN(position.y) || isNaN(points)) {
      return null;
    }

    return {
      x: position.x,
      y: position.y,
      points,
      meta, // Optional: Zusätzliche Informationen (z. B. Mathematikaufgabe)
    };
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

  ensureMathFoodForPlayers(gameState, players, equationManager) {
    const zones = this.calculateZones(this.boundaries, 10); // Beispiel: 10 Zonen

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

  calculateZones(boundaries, zoneCount) {
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

  handleFoodCollision(playerState, gameState, equationManager) {
    const { snake } = playerState;

    gameState.food = gameState.food.filter(food => {
      if (snake.checkCollisionWithFood(food)) {
        this.processFoodCollision(playerState, snake, gameState, food, equationManager);
        return false; // Entferne konsumierte Nahrung
      }
      return true; // Nahrung bleibt bestehen
    });
  }

  processFoodCollision(playerState, snake, gameState, food, equationManager) {
    if (food.meta?.result !== undefined) {
      this.handleMathFoodCollision(playerState, snake, food, equationManager);
    } else {
      this.handleNormalFoodCollision(playerState, snake, food);
    }
  }

  handleMathFoodCollision(playerState, snake, food, equationManager) {
    const correctResult = snake.currentEquation?.result;
    if (food.meta.result === correctResult) {
      this.updateScoresAndSegments(playerState, snake, food.points)
      equationManager.assignEquationToPlayer(
          playerState.sessionId,
          snake,
          snake.currentEquation.type
      );
    } else {
      this.updateScoresAndSegments(playerState, snake, food.points)
    }
  }

  handleNormalFoodCollision(playerState, snake, food) {
    this.updateScoresAndSegments(playerState, snake, food.points)
  }

  updateScoresAndSegments(playerState, snake, points) {
    playerState.score = Math.max(0, playerState.score + points);
    snake.score = Math.max(0, snake.score + points);
    snake.segmentCount = Math.max(0, snake.segmentCount + points);
  }
}

module.exports = FoodManager;
