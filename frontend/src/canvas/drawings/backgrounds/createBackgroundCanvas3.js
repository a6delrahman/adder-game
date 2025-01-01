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

  // Berechne den Radius des Kreises
  const radius = Math.min(width, height) / 2;

  // Erstelle eine runde Spielfläche
  backgroundCtx.save(); // Zustand speichern
  backgroundCtx.beginPath();
  backgroundCtx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  backgroundCtx.closePath();
  backgroundCtx.clip(); // Beschneide den Canvas-Inhalt auf den Kreis

  // 1. Strandbereich innerhalb der Grenzen
  const drawBeach = () => {
    const sandGradient = backgroundCtx.createRadialGradient(
        width / 2,
        height / 2,
        radius / 2, // Zentrum des Strandes
        width / 2,
        height / 2,
        radius // Rand des Strandes
    );
    sandGradient.addColorStop(0, "#F4E2C2"); // Hellgelb (Strandmitte)
    sandGradient.addColorStop(1, "#D2B48C"); // Sandbraun (Strandrand)

    backgroundCtx.fillStyle = sandGradient;
    backgroundCtx.fillRect(0, 0, width, height);
  };

  // 2. Wasserbereich außerhalb der Grenzen
  const drawWater = () => {
    const waterGradient = backgroundCtx.createRadialGradient(
        width / 2,
        height / 2,
        radius, // Start des Wassers
        width / 2,
        height / 2,
        radius * 1.5 // Endpunkt des Wassers
    );
    waterGradient.addColorStop(0, "rgba(135, 206, 250, 0.6)"); // Helles Blau (Übergang)
    waterGradient.addColorStop(1, "#4682B4"); // Tiefes Blau (äußeres Wasser)

    backgroundCtx.fillStyle = waterGradient;
    backgroundCtx.fillRect(0, 0, width, height);
  };

  // 3. Wellen hinzufügen
  const drawWaves = () => {
    const waveCount = 10; // Anzahl der Wellen
    const waveWidth = 20; // Breite der Wellen
    const waveColor = "rgba(255, 255, 255, 0.6)"; // Weiße Wellen

    for (let i = 0; i < waveCount; i++) {
      const waveRadius = radius + i * waveWidth;
      backgroundCtx.beginPath();
      backgroundCtx.arc(width / 2, height / 2, waveRadius, 0, Math.PI * 2);
      backgroundCtx.strokeStyle = waveColor;
      backgroundCtx.lineWidth = 2;
      backgroundCtx.stroke();
    }
  };

  // 4. Zeichnen des gesamten Hintergrunds
  drawWater(); // Zuerst Wasser
  drawBeach(); // Dann Strand
  drawWaves(); // Schließlich Wellen

  backgroundCtx.restore(); // Ursprünglichen Zustand wiederherstellen (außerhalb des Kreises zeichnen)

  return new Promise((resolve) => {
    resolve(backgroundCanvas); // Das fertige Canvas zurückgeben
  });
};
