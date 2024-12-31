import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry';

const addDoubleEffect = (snake, ctx) => {
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = 'black';
  snake.segments.forEach((segment) => {
    ctx.fillRect(segment.x + 2, segment.y + 2, snake.scale, snake.scale);
  });
  ctx.globalAlpha = 1.0;
};

registerSnakeDecorator(DesignNames.DOUBLE, addDoubleEffect);
