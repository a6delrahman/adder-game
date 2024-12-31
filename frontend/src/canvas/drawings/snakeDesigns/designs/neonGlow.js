import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry';

const neonGlow = (snake, ctx) => {
  ctx.strokeStyle = 'magenta';
  ctx.lineWidth = 2;
  snake.segments.forEach((segment) => {
    ctx.beginPath();
    ctx.arc(segment.x + snake.scale / 2, segment.y + snake.scale / 2, snake.scale / 2, 0, Math.PI * 2);
    ctx.stroke();
  });z
};

registerSnakeDecorator(DesignNames.NEON_GLOW, neonGlow);
