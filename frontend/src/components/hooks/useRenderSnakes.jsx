import { useCallback } from 'react';
import Snake from '../../classes/Snake';

const useRenderSnakes = (playerSnakeId, otherSnakes) => {
    const renderSnakes = useCallback((ctx) => {
        if (!playerSnakeId) return;
        if (!otherSnakes) return;
        Object.values(otherSnakes).forEach((snake) => {
            snake.draw(ctx);

            // const isPlayerSnake = snake.snakeId === playerSnakeId;
            // const snakeObject = new Snake(
            //     snake.position.x,
            //     snake.position.y,
            //     {
            //         color: isPlayerSnake ? 'green' : 'red',
            //         scale: isPlayerSnake ? 0.8 : 0.6,
            //     }
            // );
            // snakeObject.draw(ctx);
        });
    }, [playerSnakeId, otherSnakes]);

    return renderSnakes;
};

export default useRenderSnakes;
