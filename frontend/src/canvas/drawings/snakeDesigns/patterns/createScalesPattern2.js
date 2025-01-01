const createSnakeScalesPattern = (ctx, color = "green", backgroundColor = "darkgreen", scale = 2) => {
  // Erstelle ein Offscreen-Canvas für die Schuppen
  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = scale * 3; // Breitere Kachelgröße für Überlappung
  tileCanvas.height = scale * 2;
  const tileCtx = tileCanvas.getContext('2d');

  // Fülle den Hintergrund mit der zweiten Farbe
  tileCtx.fillStyle = backgroundColor; // Hintergrundfarbe
  tileCtx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);

  // Zeichne Schlangen-Schuppen (halbrund, überlappend)
  tileCtx.fillStyle = color; // Schuppen-Farbe

  const drawScale = (x, y, offset = 0) => {
    tileCtx.beginPath();
    tileCtx.arc(x + offset, y, scale, Math.PI, 0); // Halbrunde Schuppe
    tileCtx.fill();
    tileCtx.strokeStyle = "rgba(0, 0, 0, 0.3)"; // Subtiler Rand
    tileCtx.lineWidth = scale / 8;
    tileCtx.stroke();
  };

  // Zeichne obere Schicht von Schuppen
  for (let i = 0; i < 3; i++) {
    drawScale(i * scale, scale, scale / 2);
  }

  // Zeichne untere Schicht von Schuppen (leicht versetzt)
  for (let i = 0; i < 4; i++) {
    drawScale(i * scale - scale / 2, scale * 2);
  }

  // Erstelle das Muster
  return ctx.createPattern(tileCanvas, 'repeat');
};

export default createSnakeScalesPattern;
