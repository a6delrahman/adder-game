export const createBackgroundCanvas = (boundaries) => {
  const backgroundCanvas = document.createElement("canvas");
  const backgroundCtx = backgroundCanvas.getContext("2d");

  const { width, height } = boundaries;

  if (!width || !height || isNaN(width) || isNaN(height)) {
    throw new Error("Ungültige Werte für boundaries: width und height müssen numerisch sein.");
  }

  backgroundCanvas.width = width;
  backgroundCanvas.height = height;

  const radius = Math.min(width, height) / 2;
  const centerX = width / 2;
  const centerY = height / 2;

  // 1. Wasserbereich (Hintergrund für alles)
  const drawWater = () => {
    const waterGradient = backgroundCtx.createRadialGradient(
        centerX,
        centerY,
        radius * 1.2,
        centerX,
        centerY,
        radius * 2
    );
    waterGradient.addColorStop(0, "#87CEEB"); // Helles Blau
    waterGradient.addColorStop(1, "#4682B4"); // Tiefes Blau

    backgroundCtx.fillStyle = waterGradient;
    backgroundCtx.fillRect(0, 0, width, height);
  };

  // 2. Strandbereich (innerhalb des Kreises)
  const drawBeach = () => {
    const sandGradient = backgroundCtx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
    );
    sandGradient.addColorStop(0, "#F4E2C2"); // Hellgelber Sand
    sandGradient.addColorStop(1, "#D2B48C"); // Sandbraun

    backgroundCtx.beginPath();
    backgroundCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    backgroundCtx.fillStyle = sandGradient;
    backgroundCtx.fill();
  };

  // 3. Wellen hinzufügen (an den Rand des Kreises)
  const drawWaves = () => {
    const waveCount = 5;
    const waveWidth = 10;

    for (let i = 0; i < waveCount; i++) {
      const waveRadius = radius - i * waveWidth + waveWidth / 2;
      backgroundCtx.beginPath();
      backgroundCtx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
      backgroundCtx.strokeStyle = `rgba(255, 255, 255, ${0.3 - i * 0.05})`; // Transparente Wellen
      backgroundCtx.lineWidth = 2;
      backgroundCtx.stroke();
    }
  };

  // 4. Wiese in der Mitte mit natürlichem Übergang
  const drawGrass = () => {
    const grassRadius = radius / 2; // Begrenze die Wiese auf die Mitte
    const grassColors = ["#7CFC00", "#32CD32", "#228B22", "#6B8E23"]; // Verschiedene Grüntöne

    // Erstelle einen unregelmäßigen Rand für die Wiese
    backgroundCtx.save();
    backgroundCtx.beginPath();

    for (let angle = 0; angle < 360; angle += 1) {
      const radian = (angle * Math.PI) / 180;
      const noise = Math.random() * 15 - 7.5; // Zufällige Abweichung
      const x = centerX + Math.cos(radian) * (grassRadius + noise);
      const y = centerY + Math.sin(radian) * (grassRadius + noise);
      if (angle === 0) {
        backgroundCtx.moveTo(x, y);
      } else {
        backgroundCtx.lineTo(x, y);
      }
    }
    backgroundCtx.closePath();

    // Hintergrund-Grundfarbe (grüner Farbverlauf)
    const gradient = backgroundCtx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        grassRadius
    );
    gradient.addColorStop(0, "#a8d080"); // Hellgrün
    gradient.addColorStop(1, "#6b8e23"); // Dunkelgrün
    backgroundCtx.fillStyle = gradient;
    backgroundCtx.fill();
    backgroundCtx.restore();

    // Zeichne kleine Grashalme innerhalb der unregelmäßigen Wiese
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

    const numberOfBlades = 500; // Begrenze die Anzahl für bessere Performance
    for (let i = 0; i < numberOfBlades; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * (grassRadius - 10); // Halme innerhalb der Wiese
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const grassHeight = Math.random() * 10 + 5; // Kleine Grashalme
      const grassAngle = Math.random() * 20 - 10; // Leichte Neigung
      const color = grassColors[Math.floor(Math.random() * grassColors.length)];
      drawGrassBlade(x, y, grassHeight, grassAngle, color);
    }
  };

  // Zeichnen des gesamten Hintergrunds
  drawWater(); // Wasser im Hintergrund
  drawBeach(); // Strand
  drawWaves(); // Wellen
  drawGrass(); // Wiese in der Mitte

  return Promise.resolve(backgroundCanvas);
};
