export function drawHead(ctx, snake, designs = ["default"]) {
// Kopf zeichnen mit statischem Muster
  ctx.save(); // Speichere den Zustand
  ctx.translate(headSegment.x, headSegment.y); // Verschiebe den Ursprung zum Kopf
  ctx.rotate(headAngle); // Rotiere in Richtung des Bewegungsvektors

// Erstelle ein festes Muster für den Kopf
  const headPatternCanvas = document.createElement('canvas');
  headPatternCanvas.width = 20;
  headPatternCanvas.height = 20;
  const headPatternCtx = headPatternCanvas.getContext('2d');

// Zeichne ein diagonales Streifenmuster
  headPatternCtx.fillStyle = color;
  headPatternCtx.fillRect(0, 0, 20, 20);
  headPatternCtx.strokeStyle = "black";
  headPatternCtx.lineWidth = 2;
  headPatternCtx.beginPath();
  headPatternCtx.moveTo(0, 0);
  headPatternCtx.lineTo(20, 20);
  headPatternCtx.stroke();
  headPatternCtx.beginPath();
  headPatternCtx.moveTo(20, 0);
  headPatternCtx.lineTo(0, 20);
  headPatternCtx.stroke();

  const headPattern = ctx.createPattern(headPatternCanvas, 'repeat');

// Zeichne den Kopf mit dem festen Muster
  ctx.fillStyle = headPattern;
  ctx.beginPath();
  ctx.ellipse(0, 0, headWidth, pointedHeight, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "black"; // Kontur um den Kopf
  ctx.stroke();
  ctx.closePath();

// Füge weitere Kopfdetails hinzu (z. B. Nasenlöcher)
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(-headWidth / 4, -pointedHeight / 2, headWidth / 20, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headWidth / 4, -pointedHeight / 2, headWidth / 20, 0, 2 * Math.PI);
  ctx.fill();

// Augen zeichnen
  ctx.fillStyle = "black";
  const eyeOffset = headWidth / 4; // Reduzierter Abstand zwischen den Augen
  const eyeDistance = headWidth / 2;

// Linkes Auge
  ctx.beginPath();
  ctx.arc(-eyeOffset, -eyeDistance, headWidth / 10, 0, 2 * Math.PI); // Kleinere Augen
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.stroke(); // Kontur um das Auge

// Rechtes Auge
  ctx.beginPath();
  ctx.arc(eyeOffset, -eyeDistance, headWidth / 10, 0, 2 * Math.PI); // Kleinere Augen
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.stroke(); // Kontur um das Auge

// Glanzlichter in den Augen
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(-eyeOffset - headWidth / 20, -eyeDistance - headWidth / 20,
      headWidth / 30, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeOffset - headWidth / 20, -eyeDistance - headWidth / 20,
      headWidth / 30, 0, 2 * Math.PI);
  ctx.fill();

  ctx.restore(); // Wiederherstellen des ursprünglichen Zustands

}