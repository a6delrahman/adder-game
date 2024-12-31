const createStaticScalesPattern = (ctx, color = "green", backgroundColor = "darkgreen") => {
  // Erstelle ein Offscreen-Canvas für das Muster
  const tileCanvas = document.createElement('canvas');
  const scale = 20; // Fester Skalierungswert für das Muster
  tileCanvas.width = scale * 2; // Kachelgröße
  tileCanvas.height = scale * 2;
  const tileCtx = tileCanvas.getContext('2d');

  // Fülle den Hintergrund mit der zweiten Farbe
  tileCtx.fillStyle = backgroundColor;
  tileCtx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);

  // Zeichne ein Schuppenmuster mit gleichmäßigen Kreisen
  tileCtx.fillStyle = color;
  const drawScale = (x, y) => {
    tileCtx.beginPath();
    tileCtx.arc(x, y, scale / 2, 0, Math.PI * 2); // Kreise mit fester Größe
    tileCtx.fill();
    tileCtx.strokeStyle = "black"; // Schuppen-Umrandung
    tileCtx.lineWidth = scale / 10;
    tileCtx.stroke();
  };

  // Zeichne Schuppen in einer diagonalen Matrix
  drawScale(scale, scale / 2); // Obere Reihe
  drawScale(0, scale * 1.5); // Linke untere Reihe
  drawScale(scale * 2, scale * 1.5); // Rechte untere Reihe

  // Erstelle das Muster
  return ctx.createPattern(tileCanvas, 'repeat');
};

export default createStaticScalesPattern;
