import {useCallback} from 'react';

const useRenderScores = (otherSnakes) => {
  return useCallback((ctx, canvasWidth) => {
    if (!otherSnakes) {
      return;
    }

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left'

    const padding = 10; // Abstand vom linken Spielfeldrand
    const maxWidth = canvasWidth / 3; // Verfügbare Breite innerhalb des Spielfeldes
    const ellipsis = '...'; // Kürzungszeichen
    let yPosition = 30;

    Object.values(otherSnakes).forEach((snake) => {
      const name = snake.name || 'Unknown';
      const score = snake.score || 0;

      // Kürze den Namen, wenn er die maximale Breite überschreitet
      let displayName = name;
      let nameWidth = ctx.measureText(
          `Player ${displayName}: ${score} points`).width;

      if (nameWidth > maxWidth) {
        while (nameWidth > maxWidth && displayName.length > 0) {
          displayName = displayName.slice(0, -1);
          nameWidth = ctx.measureText(
              `Player ${displayName + ellipsis}: ${score} points`).width;
        }
        displayName += ellipsis; // Ellipsis hinzufügen
      }

      const displayText = `${displayName}: ${score} points`;
      ctx.fillText(displayText, padding, yPosition);
      yPosition += 20;
    });
  }, [otherSnakes]);
};

export default useRenderScores;
