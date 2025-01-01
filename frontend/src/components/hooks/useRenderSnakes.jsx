import { useCallback } from 'react';
import { getCombinedSnakeDecorators } from '../../canvas/drawings/snakeDesigns/snakeDesignRegistry.js';

const useRenderSnakes = (playerSnakeId, otherSnakes) => {
  return useCallback(
      (ctx) => {
        if (!playerSnakeId || !otherSnakes) return;

        Object.values(otherSnakes).forEach((snake) => {
          const designs = snake.design || ["realisticScales"]; // Fallback auf "realisticScales"
          const combinedDrawFunction = getCombinedSnakeDecorators(designs);
          combinedDrawFunction(snake, ctx); // Zeichne die Schlange mit dem Design
        });
      },
      [playerSnakeId, otherSnakes]
  );
};

export default useRenderSnakes;
