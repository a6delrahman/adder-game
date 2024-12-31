import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry.js';
import createScalesPattern from '../patterns/createScalesPattern.js';

const drawScalesSnake = (snake, ctx) => {
  const { segments, scale } = snake;

  // Erstelle das Schuppenmuster einmalig
  const scalesPattern = createScalesPattern(ctx, scale);

  segments.forEach((segment, index) => {
    ctx.fillStyle = scalesPattern;

    // Passe die Transparenz für den Schwanz an
    if (index === segments.length - 1) {
      ctx.globalAlpha = 0.8; // Schwanz transparenter
    } else {
      ctx.globalAlpha = 1.0; // Standard
    }

    // Zeichne das Segment
    ctx.beginPath();
    ctx.ellipse(segment.x, segment.y, scale, scale / 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });

  // Schatten-Effekt hinzufügen
  ctx.shadowColor = 'rgba(177,175,175,0.5)';
  ctx.shadowBlur = 5;
};

// Registriere das Design
registerSnakeDecorator(DesignNames.SCALES, drawScalesSnake);
