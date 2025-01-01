import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry';

const headHighlight = (snake, ctx) => {
  const head = snake.segments[0];
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(head.x + snake.scale / 2, head.y + snake.scale / 2, snake.scale, 0, Math.PI * 2);
  ctx.fill();
};

registerSnakeDecorator(DesignNames.HEAD_HIGHLIGHT, headHighlight);
