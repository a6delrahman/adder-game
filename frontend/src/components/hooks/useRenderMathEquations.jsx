import { useCallback } from 'react';

const useRenderMathEquations = () => {
    const renderMathEquations = useCallback((ctx, equation) => {
        if (!equation) return; // Wenn keine Aufgabe vorhanden ist, nichts zeichnen

        ctx.font = '24px Arial'; // Schriftart und -größe
        ctx.fillStyle = '#fff'; // Textfarbe
        ctx.textAlign = 'center'; // Zentriere den Text horizontal
        ctx.fillText(equation, ctx.canvas.width / 2, 30); // Zeichne den Text (x = Mitte, y = 30px vom oberen Rand)
    }, []);

    return renderMathEquations;
};

export default useRenderMathEquations;
