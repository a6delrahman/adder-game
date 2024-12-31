const createScalesPattern = (ctx, color = "green", backgroundColor = "darkgreen", scale = 2) => {

  // Erstelle ein Offscreen-Canvas für die Schuppen
  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = scale * 2; // Kachelgröße
  tileCanvas.height = scale * 2;
  const tileCtx = tileCanvas.getContext('2d');

  // Fülle den Hintergrund mit der zweiten Farbe
  tileCtx.fillStyle = backgroundColor; // Hintergrundfarbe
  tileCtx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);

  // Zeichne das Schuppenmuster
  tileCtx.fillStyle = color; // Schuppen-Farbe

  // Zeichne die obere Schuppe
  tileCtx.beginPath();
  tileCtx.arc(scale, scale, scale / 2, 0, Math.PI * 2); // Obere Schuppe
  tileCtx.fill();

  // Zeichne die linke Schuppe
  tileCtx.beginPath();
  tileCtx.arc(0, 0, scale / 2, 0, Math.PI * 2); // Linke Schuppe
  tileCtx.fill();

  // Zeichne die rechte Schuppe
  tileCtx.beginPath();
  tileCtx.arc(scale * 2, 0, scale / 2, 0, Math.PI * 2); // Rechte Schuppe
  tileCtx.fill();

  // Füge leichte Schatten oder Striche hinzu
  tileCtx.strokeStyle = "rgb(0,0,0)"; // Sehr subtiler Schatten (schwarz, 10% Deckkraft)
  tileCtx.lineWidth = scale / 10; // Linienstärke proportional zur Schuppengröße

  // Zeichne einen Rand für die obere Schuppe
  tileCtx.beginPath();
  tileCtx.arc(scale, scale, scale / 2, 0, Math.PI * 2); // Rand der oberen Schuppe
  tileCtx.stroke();

  // Zeichne diagonale Striche
  tileCtx.strokeStyle = "rgba(0,0,0,0.35)"; // Noch subtilere Linien (schwarz, 5% Deckkraft)
  tileCtx.beginPath();
  tileCtx.moveTo(0, tileCanvas.height);
  tileCtx.lineTo(tileCanvas.width, 0); // Diagonale von unten links nach oben rechts
  tileCtx.stroke();

  // Zeichne eine weitere diagonale Linie
  tileCtx.beginPath();
  tileCtx.moveTo(tileCanvas.width / 2, 0);
  tileCtx.lineTo(tileCanvas.width / 2, tileCanvas.height); // Vertikale Linie in der Mitte
  tileCtx.stroke();

  // Erstelle das Muster
  return ctx.createPattern(tileCanvas, 'repeat');
};

export default createScalesPattern;
