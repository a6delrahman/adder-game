const drawApple = (ctx, x, y, size) => {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2); // Runder Körper
  ctx.fillStyle = "red";
  ctx.fill();

  // Stiel
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y - size - 10);
  ctx.strokeStyle = "brown";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Blatt
  ctx.beginPath();
  ctx.arc(x - 5, y - size - 10, 5, 0, Math.PI * 2);
  ctx.fillStyle = "green";
  ctx.fill();
};

const drawPear = (ctx, x, y, size) => {
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 1.5, 0, 0, Math.PI * 2); // Birnenform
  ctx.fillStyle = "yellow";
  ctx.fill();

  // Stiel
  ctx.beginPath();
  ctx.moveTo(x, y - size * 1.5);
  ctx.lineTo(x, y - size * 1.5 - 10);
  ctx.strokeStyle = "brown";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Blatt
  ctx.beginPath();
  ctx.arc(x - 5, y - size * 1.5 - 10, 5, 0, Math.PI * 2);
  ctx.fillStyle = "green";
  ctx.fill();
};

const drawBanana = (ctx, x, y, size) => {
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.quadraticCurveTo(x, y - size, x + size, y);
  ctx.quadraticCurveTo(x, y + size / 2, x - size, y);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "brown";
  ctx.stroke();
};

const drawPineapple = (ctx, x, y, size) => {
  // Körper
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.8, size * 1.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#DAA520";
  ctx.fill();

  // Blattkrone
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y - size * 1.2);
    ctx.lineTo(x - size / 2 + i * size / 3, y - size * 1.8);
    ctx.lineTo(x + size / 2 - i * size / 3, y - size * 1.2);
    ctx.closePath();
    ctx.fillStyle = "green";
    ctx.fill();
  }
};

const drawWatermelon = (ctx, x, y, size) => {
  // Außen (grüne Schale)
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = "green";
  ctx.fill();

  // Innen (rote Frucht)
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();

  // Kerne
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const seedX = x + Math.cos(angle) * size * 0.5;
    const seedY = y + Math.sin(angle) * size * 0.5;
    ctx.beginPath();
    ctx.arc(seedX, seedY, 2, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
  }
};


export { drawApple, drawPear, drawBanana, drawPineapple, drawWatermelon };