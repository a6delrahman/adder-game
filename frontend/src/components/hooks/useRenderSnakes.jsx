import { useCallback } from 'react';
import { getCombinedSnakeDecorators } from '../../canvas/drawings/snakeDesigns/snakeDesignRegistry.js';

const useRenderSnakes = (playerSnakeId, otherSnakes) => {
  return useCallback(
      (ctx, designs = ["default"]) => {
        if (!playerSnakeId || !otherSnakes) return;
        if (designs.length === 0) designs = ["default"];

        const combinedDrawFunction = getCombinedSnakeDecorators(designs);
        Object.values(otherSnakes).forEach((snake) => {
          combinedDrawFunction(snake, ctx);
        });
      },
      [playerSnakeId, otherSnakes]
  );
};

export default useRenderSnakes;
