// src/canvas/drawings/snakeDesigns/designs/modern.js
import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry.js';
import drawDefaultForm from "../forms/defaultForm.js";
import drawOvalForm from "../forms/ovalForm.js";
import defaultForm from "../forms/defaultForm.js";

const drawModernSnake = (snake, ctx) => {

  snake.segments.forEach((segment) => {
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

    ctx.beginPath();
    defaultForm(ctx, segment, snake.scale);
    ctx.fill();

  });
};

// Registriere das Design
registerSnakeDecorator(DesignNames.MODERN, drawModernSnake);