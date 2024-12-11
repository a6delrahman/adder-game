import {useCallback} from 'react';

const useRenderScores = (otherSnakes) => {
    return useCallback((ctx) => {
        if (!otherSnakes) return;

        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        let yPosition = 20;

        Object.values(otherSnakes).forEach((snake) => {
            ctx.fillText(`Player ${snake.snakeId}: ${snake.score || 0} points`, 10, yPosition);
            yPosition += 20;
        });
    }, [otherSnakes]);
};

export default useRenderScores;
