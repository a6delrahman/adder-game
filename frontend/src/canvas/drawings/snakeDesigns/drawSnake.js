// Zeichne eine Schlange basierend auf den Anforderungen
export function drawSnake(ctx, snake, animationFrame) {
  const { segments, scale, color} = snake;

  // Breiter Kopf
  const headSegment = snake.headPosition;
  const headWidth = scale * 1.5;
  const tailWidth = scale / 2;
  const tongueLength = scale * 4;
  const tongueFrequency = 160;

  // Zeichne die Schlange
  segments.forEach((segment, index) => {
    const t = index / (segments.length - 1); // Position entlang der Schlange
    const width = tailWidth + (headWidth - tailWidth) * Math.sin(Math.PI * Math.min(t, 1 - t)); // Verjüngung

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, width, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Zeichne den Kopf
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(headSegment.x, headSegment.y, headWidth, 0, 2 * Math.PI);
  ctx.fill();

  // Zeichne die Augen
  ctx.fillStyle = "black";
  const eyeOffset = headWidth / 3;
  ctx.beginPath();
  ctx.arc(headSegment.x - eyeOffset, headSegment.y - eyeOffset, headWidth / 8, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(headSegment.x + eyeOffset, headSegment.y - eyeOffset, headWidth / 8, 0, 2 * Math.PI);
  ctx.fill();

  // Zeichne die Zunge (animiert)
  if (animationFrame % tongueFrequency === 0) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headSegment.x, headSegment.y);
    ctx.lineTo(headSegment.x, headSegment.y - tongueLength);
    ctx.stroke();
  }
}

// // Beispiel für eine Schlange
// const snake = {
//   segments: [
//     { x: 100, y: 300 },
//     { x: 120, y: 280 },
//     { x: 140, y: 260 },
//     { x: 160, y: 240 },
//     { x: 180, y: 220 },
//     { x: 200, y: 200 },
//   ],
//   scale: 10,
//   color: "green",
//   headWidthFactor: 2,
//   tongueLength: 20,
//   tongueFrequency: 60,
// };

// // Zeichne die Schlange auf einem Canvas
// const canvas = document.getElementById("snakeCanvas");
// const ctx = canvas.getContext("2d");
// let animationFrame = 0;

// function render() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   drawSnake(ctx, snake, animationFrame);
//   animationFrame++;
//   requestAnimationFrame(render);
// }
//
// render();
