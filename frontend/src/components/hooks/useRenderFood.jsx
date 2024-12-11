import {useCallback} from 'react';

const useRenderFood = (food) => {
    return useCallback((ctx) => {
        food.current.forEach((item) => {
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(item.x, item.y, 5, 0, Math.PI * 2);
            ctx.fill();

            if (item.meta?.result) {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.fillText(item.meta.result, item.x, item.y - 10);
            }
        });
    }, [food.current]);
};

export default useRenderFood;
