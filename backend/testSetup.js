// testSetup.js
const boundaries = { width: 1000, height: 1000 };

const createMockGameState = () => ({
  food: [],
  players: {},
  boundaries,
});

const createMockZones = (zoneCount) => {
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
        foodCount: 0,
      });
    }
  }

  return zones;
};

module.exports = { boundaries, createMockGameState, createMockZones };
