export const createBackgroundCanvas = (boundaries, imageSrc) => {
  const backgroundCanvas = document.createElement("canvas");
  const backgroundCtx = backgroundCanvas.getContext("2d");

  // Extrahiere und prüfe die Grenzen
  const { width, height } = boundaries;

  if (!width || !height || isNaN(width) || isNaN(height)) {
    throw new Error("Ungültige Werte für boundaries: width und height müssen numerisch sein.");
  }

  // Passe das Canvas an die Spielfeldgröße an
  backgroundCanvas.width = width;
  backgroundCanvas.height = height;

  // 1. Hintergrund-Grundfarbe (grüner Farbverlauf)
  const gradient = backgroundCtx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#a8d080"); // Hellgrün
  gradient.addColorStop(1, "#6b8e23"); // Dunkelgrün
  backgroundCtx.fillStyle = gradient;
  backgroundCtx.fillRect(0, 0, width, height);

  // 2. Zeichne kleine Grashalme
  const drawGrassBlade = (x, y, height, angle, color) => {
    backgroundCtx.save();
    backgroundCtx.translate(x, y);
    backgroundCtx.rotate((angle * Math.PI) / 180);
    backgroundCtx.beginPath();
    backgroundCtx.moveTo(0, 0);
    backgroundCtx.lineTo(-1, -height);
    backgroundCtx.lineTo(1, -height);
    backgroundCtx.closePath();
    backgroundCtx.fillStyle = color;
    backgroundCtx.fill();
    backgroundCtx.restore();
  };

  // Definiere Grashalmfarben
  const grassColors = ["#7CFC00", "#32CD32", "#228B22", "#6B8E23"]; // Verschiedene Grüntöne

  // Berechne die Dichte der Grashalme basierend auf der Größe
  const numberOfBlades = Math.floor((width * height) / 500); // Proportional zur Spielfeldgröße
  for (let i = 0; i < numberOfBlades; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const grassHeight = Math.random() * 10 + 5; // Kleine Grashalme zwischen 5 und 15 Pixel hoch
    const angle = Math.random() * 20 - 10; // Leichte Neigung
    const color = grassColors[Math.floor(Math.random() * grassColors.length)];
    drawGrassBlade(x, y, grassHeight, angle, color);
  }

  return new Promise((resolve) => {
    resolve(backgroundCanvas); // Das fertige Canvas zurückgeben
  });
};
