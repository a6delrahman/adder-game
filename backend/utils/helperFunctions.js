// Funktion: Zufällige Position im Spielfeld generieren
function getRandomPosition(boundaries) {
  return {
    x: Math.floor(Math.random() * boundaries.width),
    y: Math.floor(Math.random() * boundaries.height),
  };
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomUsername() {
  const adjectives = ['Fast', 'Furious', 'Swift', 'Speedy', 'Rapid', 'Quick',
    'Nimble', 'Agile', 'Brisk', 'Zippy'];
  const animals = ['Fox', 'Wolf', 'Tiger', 'Lion', 'Jaguar', 'Cheetah',
    'Panther', 'Puma', 'Leopard', 'Cougar'];
  const randomAdjective = adjectives[Math.floor(
      Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  return `${randomAdjective} ${randomAnimal}`;
}

function getRandomColor() {
  // Zufällige Zahl zwischen 0 und 16777215 (0xFFFFFF) generieren
  const randomColor = Math.floor(Math.random() * 16777216);
  // Zahl in eine hexadezimale Zeichenfolge umwandeln und mit führenden Nullen auffüllen
  return `#${randomColor.toString(16).padStart(6, '0')}`;
}

module.exports = {
  getRandomPosition,
  getRandomNumber,
  getRandomUsername,
  getRandomColor,
};