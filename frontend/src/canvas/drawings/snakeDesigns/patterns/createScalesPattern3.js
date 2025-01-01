const createSnakeScalesPattern = (ctx, color = "green", backgroundColor = "darkgreen", scale = 2) => {
  // Erstelle ein Offscreen-Canvas für die Schuppen
  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = scale * 2; // Kachelgröße
  tileCanvas.height = scale * 2;
  const tileCtx = tileCanvas.getContext('2d');

  // Fülle den Hintergrund mit der zweiten Farbe
  tileCtx.fillStyle = backgroundColor; // Hintergrundfarbe
  tileCtx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);

  // Zeichne das neue Schuppenmuster mit mehr schwarzen Linien
  tileCtx.strokeStyle = "black"; // Schwarze Linien
  tileCtx.lineWidth = scale / 10; // Dicke der Linien

  // Zeichne diagonale schwarze Linien
  tileCtx.beginPath();
  tileCtx.moveTo(0, 0);
  tileCtx.lineTo(tileCanvas.width, tileCanvas.height);
  tileCtx.stroke();

  tileCtx.beginPath();
  tileCtx.moveTo(tileCanvas.width, 0);
  tileCtx.lineTo(0, tileCanvas.height);
  tileCtx.stroke();

  // Zeichne kreisförmige Schuppen mit inneren schwarzen Details
  const drawDetailedScale = (x, y) => {
    // Äußere Schuppe
    tileCtx.fillStyle = color;
    tileCtx.beginPath();
    tileCtx.arc(x, y, scale / 2, 0, Math.PI * 2);
    tileCtx.fill();

    // Innere Details
    tileCtx.strokeStyle = "black";
    tileCtx.lineWidth = scale / 20;
    tileCtx.beginPath();
    tileCtx.arc(x, y, scale / 3, 0, Math.PI * 2);
    tileCtx.stroke();

    tileCtx.beginPath();
    tileCtx.arc(x, y, scale / 6, 0, Math.PI * 2);
    tileCtx.stroke();
  };

  // Zeichne Schuppen in einem diagonalen Muster
  drawDetailedScale(scale / 2, scale / 2);
  drawDetailedScale(scale * 1.5, scale / 2);
  drawDetailedScale(scale / 2, scale * 1.5);
  drawDetailedScale(scale * 1.5, scale * 1.5);

  // Erstelle das Muster
  return ctx.createPattern(tileCanvas, 'repeat');
};

export default createSnakeScalesPattern;
