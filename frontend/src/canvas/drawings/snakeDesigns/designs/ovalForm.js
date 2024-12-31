import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry';


const drawOvalForm = (snake, ctx, elongation = 1.5) => {
  const radiusX = snake.scale; // Horizontale Ausdehnung
  const radiusY = snake.scale / elongation; // Vertikale Ausdehnung

  snake.segments.forEach((segment, index) => {
    // Bewegungsrichtung berechnen, wenn nicht das letzte Segment
    let angle = 0;
    if (index < snake.segments.length - 1) {
      const nextSegment = snake.segments[index + 1];
      const dx = nextSegment.x - segment.x;
      const dy = nextSegment.y - segment.y;
      angle = Math.atan2(dy, dx); // Winkel in Radiant
    }

    // Zeichne das Segment als Ellipse mit berechnetem Winkel
    // ctx.fillStyle = snake.color;
    ctx.beginPath();
    ctx.ellipse(segment.x, segment.y, radiusX, radiusY, angle, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  });
};

registerSnakeDecorator(DesignNames.OVAL_FORM, drawOvalForm);
