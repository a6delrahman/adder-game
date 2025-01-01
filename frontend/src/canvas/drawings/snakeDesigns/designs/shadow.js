import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry';

const drawShadowEffect = (snake, ctx) => {
  // Konfiguriere den Schatteneffekt
  ctx.shadowColor = 'rgb(255,255,255)'; // Farbe des Schattens
  ctx.shadowBlur = 2; // Weichheit des Schattens
  ctx.shadowOffsetX = 2; // Horizontaler Offset
  ctx.shadowOffsetY = 3; // Vertikaler Offset

  // Zeichne jeden Segment-Schatten (unsichtbare Basis)
  snake.segments.forEach((segment) => {
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, snake.scale, 0, 2 * Math.PI);
    ctx.fillStyle = 'transparent'; // Keine Farbe, nur Schatten sichtbar
    ctx.fill();
  });

  // // Entferne Schatteneffekte für andere Designs
  // ctx.shadowColor = 'transparent';
  // ctx.shadowBlur = 0;
  // ctx.shadowOffsetX = 0;
  // ctx.shadowOffsetY = 0;
};

// Registriere den Schatten als eigenes Design
registerSnakeDecorator(DesignNames.SHADOW, drawShadowEffect);
