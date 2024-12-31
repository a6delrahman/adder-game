import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry';

const drawClassicSnake = (snake, ctx) => {
  ctx.fillStyle = snake.color;
  snake.segments.forEach((segment) => {
    ctx.fillRect(segment.x, segment.y, snake.scale, snake.scale);
  });
};

// Registriere das Design
registerSnakeDecorator(DesignNames.CLASSIC, drawClassicSnake);
