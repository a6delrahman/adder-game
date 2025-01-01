import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry.js';
import defaultForm from "../forms/defaultForm.js";
const drawDefaultSnake  = (snake, ctx) => {
  snake.segments.forEach((segment, index) => {
    // Erstelle den Farbverlauf für das Segment
    const gradient = ctx.createRadialGradient(
        segment.x,
        segment.y,
        0,
        segment.x,
        segment.y,
        snake.scale
    );
    gradient.addColorStop(0, snake.color); // Startfarbe
    gradient.addColorStop(1, 'black'); // Endfarbe


    // Zeichne das Segment
    ctx.fillStyle = gradient;

    if (index === 0) {
      // Kopf-Segment
      ctx.fillStyle = 'yellow'; // Auffällige Farbe für den Kopf
    }

    ctx.beginPath();
    defaultForm(ctx, segment, snake.scale);
    ctx.fill();

  });
};

// Registriere das Design
registerSnakeDecorator(DesignNames.DEFAULT, drawDefaultSnake );
