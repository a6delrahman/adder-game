import {useEffect, useRef} from 'react';

const useRenderBackground = (imageSrc) => {
    const backgroundImageRef = useRef(null);

    useEffect(() => {
        const image = new Image();
        image.src = imageSrc;
        backgroundImageRef.current = image;
    }, [imageSrc]);

    return (ctx) => {
        const image = backgroundImageRef.current;
        if (image?.complete) {
            ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
        } else {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.strokeStyle = '#ccc';
            const gridSize = 30;
            for (let x = 0; x < ctx.canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, ctx.canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < ctx.canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(ctx.canvas.width, y);
                ctx.stroke();
            }
        }
    };
};

export default useRenderBackground;
