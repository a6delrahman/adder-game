const drawHexagonPattern = (ctx, width, height) => {
  const hexSize = 30;
  const hexWidth = Math.sqrt(3) * hexSize;
  const hexHeight = 2 * hexSize;
  const offset = 0.5 * hexWidth;

  // Hexagon-Muster über die gesamte Spielfeldgröße zeichnen
  const startX = -hexWidth; // Start vor der linken Grenze
  const endX = width + hexWidth; // Bis nach der rechten Grenze
  const startY = -hexHeight; // Start vor der oberen Grenze
  const endY = height + hexHeight; // Bis nach der unteren Grenze

  for (let y = startY; y < endY; y += hexHeight * 0.75) {
    for (let x = startX; x < endX; x += hexWidth) {
      const xOffset = (Math.floor(y / (hexHeight * 0.75)) % 2 === 0) ? 0
          : offset;
      drawHexagon(ctx, x + xOffset, y, hexSize, 2);
    }
  }

};

const drawHexagon = (ctx, x, y, size, gap) => {
  const side = size - gap;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const xPos = x + side * Math.cos(angle);
    const yPos = y + side * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  }
  ctx.closePath();
  ctx.fillStyle = '#2a2f3c';
  ctx.fill();
  ctx.strokeStyle = '#101318';
  ctx.lineWidth = 1.5;
  ctx.stroke();
};

export default drawHexagonPattern;