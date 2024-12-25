import {useCallback} from 'react';

const useRenderSnakes = (playerSnakeId, otherSnakes) => {
    return useCallback((ctx) => {
        if (!playerSnakeId) return;
        if (!otherSnakes) return;
        Object.values(otherSnakes).forEach((snake) => {

            snake.draw(ctx);
        });
    }, [playerSnakeId, otherSnakes]);
};

export default useRenderSnakes;
