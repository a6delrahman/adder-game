import { useCallback, useRef } from 'react';

const useRenderFoods = (food) => {
    const animationOffset = useRef(0);

    return useCallback((ctx) => {
        animationOffset.current += 0.05; // Für pulsierenden Effekt

        food.current.forEach((item, index) => {
            // Berechnung für pulsierendes Wachstum
            const pulse = Math.sin(animationOffset.current + index) * 2 + 5;

            // Unterschiedliche Farben: zufällig oder aus meta-Daten
            const color = item.meta?.color || `hsl(${(index * 70) % 360}, 80%, 50%)`; // Zufällige Farben auf Basis von Index

            // Farbverlauf für die Nahrung
            const gradient = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, pulse);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'black');

            // Zeichne Nahrungskreis
            ctx.beginPath();
            ctx.arc(item.x, item.y, pulse, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fill();

            // Falls meta vorhanden ist, Text anzeigen
            if (item.meta?.result) {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.fillText(item.meta.result, item.x, item.y - 10);
            }
        });
    }, [food.current]);
};

export default useRenderFoods;



//
// import { useCallback, useRef } from 'react';
//
// const useRenderFood = (food) => {
//     const animationOffset = useRef(0);
//
//     return useCallback((ctx) => {
//         animationOffset.current += 0.05; // Für pulsierende Animation
//
//         food.current.forEach((item) => {
//             // Berechnung für pulsierendes Wachstum
//             const pulse = Math.sin(animationOffset.current) * 2 + 5;
//
//             // Farbverlauf für die Nahrung
//             const gradient = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, pulse);
//             gradient.addColorStop(0, 'orange');
//             gradient.addColorStop(1, 'darkred');
//
//             // Zeichne Nahrungskreis
//             ctx.beginPath();
//             ctx.arc(item.x, item.y, pulse, 0, Math.PI * 2);
//             ctx.fillStyle = gradient;
//             ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
//             ctx.shadowBlur = 10;
//             ctx.fill();
//
//             // Falls meta vorhanden ist, Text anzeigen
//             if (item.meta?.result) {
//                 ctx.font = '14px Arial';
//                 ctx.fillStyle = '#fff';
//                 ctx.textAlign = 'center';
//                 ctx.fillText(item.meta.result, item.x, item.y - 10);
//             }
//         });
//     }, [food.current]);
// };
//
// export default useRenderFood;
