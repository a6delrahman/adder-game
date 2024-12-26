const FoodManager = require('../managers/foodManager');
const { boundaries, createMockGameState, createMockZones } = require('../testSetup');

describe('FoodManager', () => {
  let foodManager;

  beforeEach(() => {
    foodManager = new FoodManager(boundaries, 2, 5); // minFoodPerZone: 2, maxFoodPerZone: 5
  });

  test('generates random food', () => {
    const food = foodManager.generateRandomFood(100);
    expect(food.length).toBe(100);

    food.forEach(item => {
      expect(item.x).toBeGreaterThanOrEqual(0);
      expect(item.x).toBeLessThanOrEqual(boundaries.width);
      expect(item.y).toBeGreaterThanOrEqual(0);
      expect(item.y).toBeLessThanOrEqual(boundaries.height);
      expect(item.points).toBeGreaterThanOrEqual(1);
      expect(item.points).toBeLessThanOrEqual(5);
    });
  });

  test('replenishes food in under-populated zones', () => {
    const gameState = createMockGameState();
    const zones = createMockZones(4); // 4x4 Grid

    gameState.food.push(
        { x: 100, y: 100, points: 3 },
        { x: 300, y: 300, points: 2 },
    );

    zones[0].foodCount = 1; // Unterbesetzt
    zones[1].foodCount = 3; // Ausreichend

    foodManager.replenishFoodInZones(gameState, zones);

    expect(gameState.food.length).toBeGreaterThan(2); // Nahrung sollte ergänzt sein
  });

  test('handles food collisions correctly', () => {
    const mockSnake = {
      checkCollisionWithFood: jest.fn(food => food.x === 100 && food.y === 100),
      score: 0,
    };

    const playerState = { snake: mockSnake, score: 0 };
    const gameState = createMockGameState();

    gameState.food.push(
        { x: 100, y: 100, points: 5 },
        { x: 200, y: 200, points: 3 },
    );

    foodManager.handleFoodCollision(playerState, gameState, () => {}, () => {});

    expect(mockSnake.score).toBe(5);
    expect(playerState.score).toBe(5);
    expect(gameState.food.length).toBe(1); // Eine Nahrung entfernt
  });
});
