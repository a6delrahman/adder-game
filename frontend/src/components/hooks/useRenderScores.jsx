import { useCallback } from 'react';

const useRenderScores = (playerSnakeId, otherSnakes) => {
  return useCallback((ctx, canvasWidth) => {
    if (!playerSnakeId || !otherSnakes) {
      return;
    }



    ctx.fillStyle = '#000'; // Dark text color for better contrast on parchment
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';

    const padding = 20; // Adjust padding to fit within the parchment
    const maxWidth = canvasWidth / 4 - 20; // Adjust maxWidth to fit within the parchment
    const ellipsis = '...';
    let yPosition = 40; // Adjust starting y position to fit within the parchment


    Object.values(otherSnakes)
    .sort((a, b) => b.score - a.score)
    .forEach((snake, index) => {
      const name = snake.name || 'Unknown';
      const score = snake.score || 0;

      let displayName = name;
      let nameWidth = ctx.measureText(`${index + 1}. Player ${displayName}: ${score} points`).width;

      if (nameWidth > maxWidth) {
        while (nameWidth > maxWidth && displayName.length > 0) {
          displayName = displayName.slice(0, -1);
          nameWidth = ctx.measureText(`${index + 1}. Player ${displayName + ellipsis}: ${score} points`).width;
        }
        displayName += ellipsis;
      }



      const displayText = `${index + 1}. ${displayName}: ${score} points`;
      if (snake.snakeId === playerSnakeId) {
        ctx.fillStyle = 'green';
        ctx.font = 'bold 16px Arial';
      } else {
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
      }



      ctx.fillText(displayText, padding, yPosition);
      yPosition += 20;
    });
  }, [otherSnakes, playerSnakeId]);
};

export default useRenderScores;