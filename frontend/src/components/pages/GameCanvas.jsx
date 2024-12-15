import React, { useEffect, useRef } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import useRenderBackground from "../hooks/useRenderBackground.jsx";
import useRenderSnakes from "../hooks/useRenderSnakes.jsx";
import useRenderFood from "../hooks/useRenderFood.jsx";
import useRenderScores from "../hooks/useRenderScores.jsx";
import useRenderMathEquations from "../hooks/useRenderMathEquations.jsx";

const GameCanvas = () => {
    const canvasRef = useRef(null); // Canvas-Referenz
    const boost = useRef(false); // Boost-Status
    const {playerSnakeId, otherSnakes, sendMessage, boundaries, food} = useWebSocket(); // Zugriff auf den zentralisierten Zustand
    const backgroundImageRef = useRef(null); // Referenz für das Hintergrundbild

    // Custom Hooks
    // const drawBackground = useRenderBackground('/src/assets/cosmos.jpg');
    const renderSnakes = useRenderSnakes(playerSnakeId, otherSnakes);
    const renderFood = useRenderFood(food);
    const renderScores = useRenderScores(otherSnakes);
    const renderMathEquations = useRenderMathEquations(otherSnakes[playerSnakeId]);

    // Sendet die Bewegung an den Server
    const sendMovementData = (mouseX, mouseY) => {
        const ownSnake = otherSnakes[playerSnakeId];
        if (!ownSnake) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const targetX_ = mouseX - rect.left;
        const targetY_ = mouseY - rect.top;

        const camera = getCameraPosition(ownSnake.headPosition, boundaries.current, canvas.width, canvas.height);
        const targetX = targetX_ + camera.x;
        const targetY = targetY_ + camera.y;

        // playerSnakeRef.current.updatePositionLocal(targetX, targetY);
        // playerSnakeRef.current.moveSnake(targetX, targetY);

        ownSnake.updateDirection(targetX, targetY);


        // playerSnake.current.updateDirection(targetX, targetY);
        sendMessage({
            type: 'change_direction',
            snakeId: playerSnakeId,
            targetX,
            targetY,
            boost: boost.current,
        });
    };

    // Bild vorab laden
    useEffect(() => {
        const image = new Image();
        image.src = '/src/assets/cosmos.jpg' // Bild-URL
        backgroundImageRef.current = image;
    }, []);

    // useEffect(() => {
    //     let animationFrameId; // Speichert die ID des aktuellen Frames
    //
    //     const renderLoop = (timestamp) => {
    //         // Hier kann der timestamp verwendet werden, um Animationen zu steuern
    //         console.log(`Current timestamp: ${timestamp}`);
    //         render(); // Starte das Zeichnen
    //         animationFrameId = requestAnimationFrame(renderLoop); // Plan den nächsten Frame
    //     };
    //
    //     renderLoop(); // Starte die Schleife
    //
    //     return () => cancelAnimationFrame(animationFrameId); // Stoppe die Schleife beim Unmount
    // }, []);


    // // Haupt-Rendering-Schleife
    // const render = () => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    //
    //
    //     drawBackground(ctx); // Hintergrund zeichnen
    //     renderSnakes(ctx); // Schlangen zeichnen
    //     renderScores(ctx); // Punktzahlen zeichnen
    //     renderFood(ctx); // Essen zeichnen
    //
    //     if (otherSnakes[playerSnakeId]?.currentEquation) {
    //         renderMathEquations(ctx, otherSnakes[playerSnakeId].currentEquation.equation);
    //     }
    //
    //     // requestAnimationFrame(render); // Nächsten Frame planen
    // };

    const render = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const ownSnake = otherSnakes[playerSnakeId];

        if (!ownSnake) return;

        // Berechne die Kamera-Position basierend auf dem Kopf der Schlange
        const camera = getCameraPosition(ownSnake.headPosition, boundaries.current, canvas.width, canvas.height);

        // Clear the Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Zeichne den Hintergrund (transformiere die Position basierend auf der Kamera)
        drawBackground(ctx, camera, boundaries.current);

        // Zeichne die Schlangen
        Object.values(otherSnakes).forEach(snake => {
            snake.segments.forEach(segment => {
                const transformed = transformPosition(segment, camera);
                ctx.beginPath();
                ctx.arc(transformed.x, transformed.y, snake.scale, 0, 2 * Math.PI);
                ctx.fillStyle = snake.color;
                ctx.fill();
            });
        });

        // Zeichne das Essen
        if (food?.current) {
            Object.values(food.current).forEach(foodItem => {
                const transformed = transformPosition(foodItem, camera);
                // Debugging-Ausgabe
                // console.log('Drawing Food at:', transformed);
                ctx.beginPath();
                ctx.arc(transformed.x, transformed.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            });
        } else {
            console.warn('No food items to draw.');
        }

        // Zeichne Punktzahlen, Gleichungen oder andere UI-Elemente hier
    };

    // const drawBackground = (ctx, camera) => {
    //     const canvas = canvasRef.current; // Zugriff auf das Canvas-Element
    //     const image = backgroundImageRef.current;
    //
    //     // Debug: Kamera-Position prüfen
    //     console.log('Camera Position:', camera);
    //
    //     if (image) {
    //         ctx.drawImage(
    //             image,
    //             camera.x,
    //             camera.y,
    //             canvas.width,
    //             canvas.height,
    //             0,
    //             0,
    //             canvas.width,
    //             canvas.height
    //         );
    //     } else {
    //         console.warn('Background image not loaded');
    //     }
    // };

    const drawBackground = (ctx, camera, boundaries) => {
        const canvas = canvasRef.current;
        const hexSize = 30; // Größe der Hexagone
        const gap = 2; // Abstand zwischen Hexagonen
        const hexWidth = Math.sqrt(3) * hexSize; // Breite eines Hexagons
        const hexHeight = 2 * hexSize; // Höhe eines Hexagons
        const offset = 0.5 * hexWidth; // Versatz für jede zweite Reihe

        // Hintergrundfarbe
        ctx.fillStyle = '#1b1f2a'; // Dunkles Blau
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bereiche außerhalb der Boundary rot einfärben
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Halbtransparentes Rot
        // Links
        ctx.fillRect(0, 0, -camera.x, canvas.height); // Bereich links der Spielfeldgrenze
        // Rechts
        ctx.fillRect(boundaries.width - camera.x, 0, canvas.width - boundaries.width + camera.x, canvas.height);
        // Oben
        ctx.fillRect(0, 0, canvas.width, -camera.y); // Bereich oberhalb der Spielfeldgrenze
        // Unten
        ctx.fillRect(0, boundaries.height - camera.y, canvas.width, canvas.height - boundaries.height + camera.y);


        // Hexagon-Muster über die gesamte Spielfeldgröße zeichnen
        const startX = -hexWidth; // Start vor der linken Grenze
        const endX = boundaries.width + hexWidth; // Bis nach der rechten Grenze
        const startY = -hexHeight; // Start vor der oberen Grenze
        const endY = boundaries.height + hexHeight; // Bis nach der unteren Grenze

        for (let y = startY; y < endY; y += hexHeight * 0.75) {
            for (let x = startX; x < endX; x += hexWidth) {
                const xOffset = (Math.floor(y / (hexHeight * 0.75)) % 2 === 0) ? 0 : offset;
                drawHexagon(ctx, x + xOffset - camera.x, y - camera.y, hexSize, gap);
            }
        }


        // Boundary (Grenze) rot zeichnen
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.strokeRect(-camera.x, -camera.y, boundaries.width, boundaries.height);

    };

// Hilfsfunktion: Zeichnet ein Hexagon
    const drawHexagon = (ctx, x, y, size, gap) => {
        const side = size - gap; // Berücksichtige den Abstand
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i; // 60° für jedes Hexagon
            const xPos = x + side * Math.cos(angle);
            const yPos = y + side * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(xPos, yPos);
            } else {
                ctx.lineTo(xPos, yPos);
            }
        }
        ctx.closePath();
        ctx.fillStyle = '#2a2f3c'; // Hexagon-Füllfarbe (etwas heller als der Hintergrund)
        ctx.fill();
        ctx.strokeStyle = '#101318'; // Hexagon-Randfarbe
        ctx.lineWidth = 1.5; // Breite des Randes
        ctx.stroke();
    };




    // setInterval(() => {
    //     if (otherSnakes.length > 0) {
    //         otherSnakes.moveSnake();
    //     }
    // }   , 50);

    useEffect(() => {
        const loop = () => {
            render();
            requestAnimationFrame(loop);
        };

        loop(); // Starte die Schleife
        return () => cancelAnimationFrame(loop); // Stoppe die Schleife beim Unmount
    }, [otherSnakes, food]); // Abhängigkeiten hinzufügen


    // Starte das Rendering und füge Event-Listener hinzu
    useEffect(() => {

        const handleMouseMove = (e) => sendMovementData(e.clientX, e.clientY);
        const handleMouseDown = (e) => {
            if (e.button === 0) {
                boost.current = true;
                sendMovementData(e.clientX, e.clientY);
            }
        };
        const handleMouseUp = (e) => {
            if (e.button === 0) {
                boost.current = false;
                sendMovementData(e.clientX, e.clientY);
            }
        };

        const canvas = canvasRef.current;
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);

        // Trenne WebSocket-Verbindung beim Verlassen der Komponente oder Wechsel der Session
        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const getCameraPosition = (snakeHead, boundaries, viewportWidth, viewportHeight) => {
        // console.log('snakeHead:', snakeHead);
        // console.log('boundaries:', boundaries);
        // console.log('viewportWidth:', viewportWidth);
        // console.log('viewportHeight:', viewportHeight);

        // Kamera zentriert auf den Kopf der Schlange
        let cameraX = snakeHead.x - viewportWidth / 2;
        let cameraY = snakeHead.y - viewportHeight / 2;

        // console.log('Initial cameraX:', cameraX, 'Initial cameraY:', cameraY);

        // // Begrenze die Kamera
        // cameraX = Math.max(0, Math.min(cameraX, boundaries.width - viewportWidth));
        // cameraY = Math.max(0, Math.min(cameraY, boundaries.height - viewportHeight));

        // console.log('Clamped cameraX:', cameraX, 'Clamped cameraY:', cameraY);

        return { x: cameraX, y: cameraY };
    };


    const transformPosition = (position, camera) => ({
        x: position.x - camera.x,
        y: position.y - camera.y,
    });




    return <canvas ref={canvasRef} width={800} height={600} />;
};

export default GameCanvas;
