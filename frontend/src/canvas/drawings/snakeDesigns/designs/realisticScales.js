import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry.js';
import createScalesPattern from '../patterns/createScalesPattern4.js';

const drawRealisticScalesSnake = (snake, ctx) => {
  const {segments, scale, color, secondColor, direction, boost} = snake;
  const pattern = createScalesPattern(ctx, color, secondColor);

  // Kopfbreite und Schwanzbreite
  const headWidthFactor = 1.5;
  const neckWidthFactor = 1;
  const tailWidthFactor = 0.4;
  const headSegment = snake.headPosition;
  const headWidth = scale * headWidthFactor;
  const neckWidth = scale * neckWidthFactor;
  const tailWidth = scale * tailWidthFactor;
  const tongueLength = scale;
  const tongueFrequency = 20;

  // Schuppenzeichnung entlang der Segmente
  segments.forEach((segment, index) => {
    const nextSegment = segments[index + 1];
    const t = index / (segments.length - 1); // Position entlang der Schlange
    const rotationOffset = (index % 2 === 0 ? Math.PI / 8 : -Math.PI / 8);

    // Mindestbreiten für Nacken und Schwanz
    const minNeckWidth = neckWidth; // Festgelegte Nackenbreite

    // Berechnung der Segmentbreite mit einem sanften Übergang
    let width = tailWidth + (neckWidth - tailWidth) * (1 - Math.pow(
        2 * t - 1, 2));

    let angle = 0;
    if (nextSegment) {
      angle = Math.atan2(nextSegment.y - segment.y,
          nextSegment.x - segment.x); // Richtung zum nächsten Segment
    }

    ctx.save(); // Speichere den aktuellen Zustand
    ctx.translate(segment.x, segment.y); // Verschiebe den Ursprung zum Segment
    ctx.rotate(angle + rotationOffset); // Rotiere das Muster entsprechend der Richtung + Offset

    // Setze eine variierte Farbe
    const hueShift = index * 5 % 360;
    const segmentColor = `hsl(${hueShift}, 80%, 50%)`;
    ctx.fillStyle = pattern || segmentColor;

    // Zeichne die Ellipse mit Variation
    ctx.globalAlpha = 1 - (index / segments.length) * 0.2; // Leichte Transparenz
    ctx.beginPath();
    ctx.ellipse(0, 0, width, width / 1.5, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    ctx.restore(); // Wiederherstellen des vorherigen Zustands
  });




// Kopf zeichnen mit statischem Muster
  ctx.save(); // Speichere den Zustand
  const headAngle = Math.atan2(direction.y, direction.x);
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

// Passe die Höhe der Ellipse an, um eine spitzere Form zu erzeugen
  const pointedHeight = headWidth / 2; // Kleinere vertikale Achse für die Spitze

// Zeichne den Kopf mit dem festen Muster
  ctx.fillStyle = headPattern;
  ctx.beginPath();
  ctx.ellipse(0, 0, headWidth, pointedHeight, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.lineWidth = scale / 20;
  ctx.strokeStyle = "black"; // Kontur um den Kopf
  ctx.stroke();
  ctx.closePath();
  ctx.restore(); // Wiederherstellen des ursprünglichen Zustands

// Augen zeichnen
  ctx.fillStyle = "black";

// Berechne den Winkel basierend auf der Richtung
  const eyeOffset = headWidth / 4; // Reduzierter Abstand zwischen den Augen
  const eyeDistance = headWidth / 2; // Augen etwas weiter nach vorne
  const eyeAngle = Math.atan2(direction.y, direction.x); // Winkel der Bewegung

// Berechne die Position der linken und rechten Augen
  const eyeCenterX = headSegment.x + Math.cos(eyeAngle) * eyeDistance;
  const eyeCenterY = headSegment.y + Math.sin(eyeAngle) * eyeDistance;

  const leftEyeX = eyeCenterX + Math.cos(eyeAngle - Math.PI / 2) * eyeOffset;
  const leftEyeY = eyeCenterY + Math.sin(eyeAngle - Math.PI / 2) * eyeOffset;

  const rightEyeX = eyeCenterX + Math.cos(eyeAngle + Math.PI / 2) * eyeOffset;
  const rightEyeY = eyeCenterY + Math.sin(eyeAngle + Math.PI / 2) * eyeOffset;

// Zeichne das linke Auge
  ctx.beginPath();
  ctx.arc(leftEyeX, leftEyeY, headWidth / 10, 0, 2 * Math.PI); // Kleinere Augen
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.stroke(); // Kontur um das Auge

// Zeichne das rechte Auge
  ctx.beginPath();
  ctx.arc(rightEyeX, rightEyeY, headWidth / 10, 0, 2 * Math.PI); // Kleinere Augen
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.stroke(); // Kontur um das Auge

// Glanzlichter in den Augen
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(leftEyeX - headWidth / 20, leftEyeY - headWidth / 20, headWidth / 30, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rightEyeX - headWidth / 20, rightEyeY - headWidth / 20, headWidth / 30, 0, 2 * Math.PI);
  ctx.fill();








// Zunge animieren
  if (boost) {
    ctx.strokeStyle = "red";

    // Dynamische Dicke der Zunge basierend auf der Kopfgröße
    ctx.lineWidth = headWidth / 5; // Die Dicke ist proportional zur Kopfbreite

    ctx.beginPath();

    // Verschiebe den Startpunkt der Zunge leicht nach vorne
    const tongueStartX = headSegment.x + direction.x * (headWidth);
    const tongueStartY = headSegment.y + direction.y * (headWidth);

    ctx.moveTo(tongueStartX, tongueStartY);

    // Gewellte Zunge zeichnen
    const segments = 5; // Anzahl der Wellen
    const waveAmplitude = headWidth / 4; // Amplitude der Wellen proportional zur Kopfgröße
    const segmentLength = tongueLength / segments;

    for (let i = 1; i <= segments; i++) {
      // Berechne den nächsten Punkt auf der Zunge
      const progress = i / segments;
      const waveOffset = Math.sin(
              Date.now() / tongueFrequency + progress * Math.PI * 2)
          * waveAmplitude;

      const nextX = tongueStartX + direction.x * (segmentLength * i)
          + direction.y * waveOffset;
      const nextY = tongueStartY + direction.y * (segmentLength * i)
          - direction.x * waveOffset;

      ctx.lineTo(nextX, nextY);
    }

    ctx.stroke();
  }
};

// Registriere das Design
registerSnakeDecorator(DesignNames.REALISTIC_SCALES, drawRealisticScalesSnake);
