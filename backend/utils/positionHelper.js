// Funktion: Zufällige Position im Spielfeld generieren
function getRandomPosition(boundaries) {
  return {
    x: Math.floor(Math.random() * boundaries.width),
    y: Math.floor(Math.random() * boundaries.height),
  };
}

module.exports = {
  getRandomPosition,
};