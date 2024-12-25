import {useCallback} from 'react';

const useRenderMathEquations = (equation) => {
    return useCallback((ctx) => {
        if (!equation) return; // Wenn keine Aufgabe vorhanden ist, nichts zeichnen

        ctx.font = '24px Arial'; // Schriftart und -größe
        ctx.fillStyle = '#fff'; // Textfarbe
        ctx.textAlign = 'center'; // Zentriere den Text horizontal
        ctx.fillText(equation, ctx.canvas.width / 2, 30); // Zeichne den Text (x = Mitte, y = 30px vom oberen Rand)
    }, [equation]);
};

export default useRenderMathEquations;
