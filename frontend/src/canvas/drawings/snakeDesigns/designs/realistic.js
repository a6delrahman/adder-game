import { registerSnakeDecorator, DesignNames } from '../snakeDesignRegistry.js';
import drawOvalForm from "../forms/ovalForm.js";

const drawRealisticSnake = (snake, ctx) => {
  const { segments, scale, color, direction } = snake;

  segments.forEach((segment, index) => {
    const nextSegment = segments[index + 1];
    const angle = nextSegment
        ? Math.atan2(nextSegment.y - segment.y, nextSegment.x - segment.x) // Richtung zum nächsten Segment
        : Math.atan2(direction.y, direction.x); // Richtung der Schlange

    // Erstelle den Farbverlauf für das Segment
    const gradient = ctx.createRadialGradient(
        segment.x,
        segment.y,
        0,
        segment.x,
        segment.y,
        scale
    );

    // Kopf hervorheben
    if (index === 0) {
      gradient.addColorStop(0, 'yellow'); // Kopf-Farbe
      gradient.addColorStop(1, color);
    } else {
      // Standard-Farben für den Körper
      gradient.addColorStop(0, color); // Startfarbe
      gradient.addColorStop(1, 'black'); // Endfarbe
    }

    // Zeichne das Segment
    ctx.fillStyle = gradient;

    // Passe die Form des Segments an (z. B. ovale Form)
    const elongation = index === 0 ? 2 : 1.5; // Kopf leicht länglich
    drawOvalForm(ctx, segment, scale, elongation, angle);

    // Optional: Schwanz schmaler machen
    if (index === segments.length - 1) {
      ctx.globalAlpha = 0.7; // Leicht transparent
    } else {
      ctx.globalAlpha = 1.0; // Standard
    }
  });

  // Schatten-Effekt hinzufügen
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 5;
};

// Registriere das Design
registerSnakeDecorator(DesignNames.REALISTIC, drawRealisticSnake);
