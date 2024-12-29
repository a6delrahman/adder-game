// GameCanvas.jsx

import React, {useEffect, useRef, useState} from 'react';
import {useWebSocket} from '../../context/WebSocketContext';
import useRenderBackground from "../hooks/useRenderBackground.jsx";
import useRenderSnakes from "../hooks/useRenderSnakes.jsx";
import useRenderFood from "../hooks/useRenderFood.jsx";
import useRenderScores from "../hooks/useRenderScores.jsx";
import useRenderMathEquations from "../hooks/useRenderMathEquations.jsx";
import useCamera from "../hooks/useCamera.jsx";

const GameCanvas = () => {
  const canvasRef = useRef(null); // Canvas-Referenz
  const backgroundCanvasRef = useRef(null); // Offscreen-Canvas für Hintergrund
  const boost = useRef(false); // Boost-Status
  const {
    playerSnakeId,
    otherSnakes,
    sendMessage,
    boundaries,
    food,
    currentEquation
  } = useWebSocket(); // Zugriff auf den zentralisierten Zustand
  const backgroundImageRef = useRef(null); // Referenz für das Hintergrundbild
  const zoomLevel = useRef(3); // Start-Zoomlevel (1.5 = 150%)

  // Custom Hooks
  const renderBackground = useRenderBackground('/src/assets/cosmos.jpg');
  const renderSnakes = useRenderSnakes(playerSnakeId, otherSnakes);
  const renderFood = useRenderFood(food);
  const renderScores = useRenderScores(otherSnakes);
  const renderMathEquations = useRenderMathEquations(currentEquation.equation);
  const getCameraPosition = useCamera();

  const [showScores, setShowScores] = useState(true); // Zustand für Scores-Anzeige

  const toggleScores = () => setShowScores(prev => !prev);

  // Event-Listener für Tastendruck (nur auf dem Desktop)
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 's' || e.key === 'S') { // Toggle mit "S"-Taste
        toggleScores();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Canvas-Größe anpassen
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  useEffect(() => {
    resizeCanvas(); // Initiale Anpassung
    window.addEventListener('resize', resizeCanvas); // Listener für Fensteränderung
    return () => {
      window.removeEventListener('resize', resizeCanvas); // Listener entfernen
    };
  }, []);

// // Overlay zeichnen (Scores + MathEquations)
//     const renderOverlay = () => {
//         const overlayCanvas = overlayCanvasRef.current;
//         const ctx = overlayCanvas.getContext('2d');
//
//         ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height); // Nur das Overlay löschen
//
//         // MathEquations (oben zentriert)
//         if (currentEquation) {
//             ctx.font = '24px Arial';
//             ctx.fillStyle = '#fff';
//             ctx.textAlign = 'center';
//             ctx.fillText(currentEquation.equation, overlayCanvas.width / 2, 50);
//         }
//
//         // Scores (unten links)
//         if (showScores) {
//             ctx.font = '16px Arial';
//             ctx.fillStyle = '#fff';
//             let yPosition = overlayCanvas.height - 100; // Start 100px über dem unteren Rand
//             Object.values(otherSnakes).forEach((snake) => {
//                 ctx.fillText(`Player ${snake.snakeId}: ${snake.score || 0} points`, 20, yPosition);
//                 yPosition += 20;
//             });
//         }
//     };
//
//
//     useEffect(() => {
//         const overlayLoop = () => {
//             renderOverlay();
//             requestAnimationFrame(overlayLoop);
//         };
//         overlayLoop();
//     }, [showScores, otherSnakes, currentEquation]);

  useEffect(() => {
    backgroundCanvasRef.current = document.createElement('canvas');
  }, []);
  // backgroundCanvasRef.current = document.createElement('canvas');
  // const backgroundCtx = backgroundCanvas.getContext('2d');

  // Sendet die Bewegung an den Server
  const sendMovementData = (mouseX, mouseY) => {
    const ownSnake = otherSnakes[playerSnakeId];
    if (!ownSnake) {
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Mauskoordinaten relativ zum Canvas
    const targetX_ = (mouseX - rect.left) / zoomLevel.current;
    const targetY_ = (mouseY - rect.top) / zoomLevel.current;

    const camera = getCameraPosition(ownSnake.headPosition,
        zoomLevel.current,
        {width: canvas.width, height: canvas.height});
    const targetX = targetX_ + camera.x;
    const targetY = targetY_ + camera.y;

    // console.log('targetX:', targetX, 'targetY:', targetY, 'mouseX:', mouseX, 'mouseY:', mouseY, 'camera:', camera);

    // playerSnakeRef.current.updatePositionLocal(targetX, targetY);
    // playerSnakeRef.current.moveSnake(targetX, targetY);

    // ownSnake.updateDirection(targetX, targetY);

    // playerSnake.current.updateDirection(targetX, targetY);
    const payload = {
      snakeId: playerSnakeId,
      targetX,
      targetY,
      boost: boost.current,
    }
    sendMessage({
      type: 'change_direction',
      payload: payload,
    });
  };

  useEffect(() => {
    const image = new Image();
    image.src = '/src/assets/cosmos.jpg';
    backgroundImageRef.current = image;

    image.onload = () => {
      // Hintergrund einmal auf das Offscreen-Canvas zeichnen
      const backgroundCanvas = backgroundCanvasRef.current;
      const backgroundCtx = backgroundCanvas.getContext('2d');
      const boundariesWidth = boundaries.current.width;
      const boundariesHeight = boundaries.current.height;

      // Passe das Offscreen-Canvas an die Spielfeldgröße an
      backgroundCanvas.width = boundariesWidth;
      backgroundCanvas.height = boundariesHeight;

      // Hintergrund zeichnen
      backgroundCtx.drawImage(image, 0, 0, boundariesWidth, boundariesHeight);

      // Hexagon-Muster (optional)
      drawHexagonPattern(backgroundCtx, boundariesWidth, boundariesHeight);

    };
  }, [boundaries]);

  const drawHexagonPattern = (ctx, width, height) => {
    const hexSize = 30;
    const hexWidth = Math.sqrt(3) * hexSize;
    const hexHeight = 2 * hexSize;
    const offset = 0.5 * hexWidth;

    // Hexagon-Muster über die gesamte Spielfeldgröße zeichnen
    const startX = -hexWidth; // Start vor der linken Grenze
    const endX = width + hexWidth; // Bis nach der rechten Grenze
    const startY = -hexHeight; // Start vor der oberen Grenze
    const endY = height + hexHeight; // Bis nach der unteren Grenze

    for (let y = startY; y < endY; y += hexHeight * 0.75) {
      for (let x = startX; x < endX; x += hexWidth) {
        const xOffset = (Math.floor(y / (hexHeight * 0.75)) % 2 === 0) ? 0
            : offset;
        drawHexagon(ctx, x + xOffset, y, hexSize, 2);
      }
    }

  };

  const drawHexagon = (ctx, x, y, size, gap) => {
    const side = size - gap;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const xPos = x + side * Math.cos(angle);
      const yPos = y + side * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    }
    ctx.closePath();
    ctx.fillStyle = '#2a2f3c';
    ctx.fill();
    ctx.strokeStyle = '#101318';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  // // Bild vorab laden
  // useEffect(() => {
  //     const image = new Image();
  //     image.src = '/src/assets/cosmos.jpg' // Bild-URL
  //     backgroundImageRef.current = image;
  // }, []);

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

  const isInView = (position, camera, viewportWidth, viewportHeight) => {
    return (
        position.x >= camera.x &&
        position.x <= camera.x + viewportWidth &&
        position.y >= camera.y &&
        position.y <= camera.y + viewportHeight
    );
  };

  const render = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const ownSnake = otherSnakes[playerSnakeId];

    if (!ownSnake) {
      return;
    }

    // Calculate the camera position based on the snake's head and zoom level
    const camera = getCameraPosition(
        ownSnake.headPosition,
        zoomLevel.current,
        {width: canvas.width, height: canvas.height}
    );

    // Clear the canvas
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and camera translation
    ctx.scale(zoomLevel.current, zoomLevel.current);
    ctx.translate(-camera.x, -camera.y);

    // Kopiere den vorberechneten Hintergrund vom Offscreen-Canvas
    const backgroundCanvas = backgroundCanvasRef.current;
    if (backgroundCanvas) {
      ctx.drawImage(backgroundCanvas, 0, 0, boundaries.current.width,
          boundaries.current.height);
    }

    renderSnakes(ctx); // Draw snakes
    renderFood(ctx); // Draw food

    // // Bereiche außerhalb der Boundary rot einfärben
    // ctx.fillStyle = 'rgba(200, 0, 0, 0.3)'; // Halbtransparentes Rot
    // // Links
    // ctx.fillRect(0, 0, -camera.x, canvas.height);
    // // Rechts
    // ctx.fillRect(boundaries.width - camera.x, 0, canvas.width - boundaries.width + camera.x, canvas.height);
    // // Oben
    // ctx.fillRect(0, 0, canvas.width, -camera.y);
    // // Unten
    // ctx.fillRect(0, boundaries.height - camera.y, canvas.width, canvas.height - boundaries.height + camera.y);

    // Boundary (Grenze) rot zeichnen
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.strokeRect(-camera.x, -camera.y, boundaries.width, boundaries.height);

    // Overlays zeichnen (Scores und MathEquations)
    ctx.restore(); // Rückkehr zur ursprünglichen Position ohne Zoom
    ctx.save();

    // MathEquations (oben zentriert)
    if (currentEquation) {
      renderMathEquations(ctx);
    }

    // Scores (oben links)
    if (showScores) {
      renderScores(ctx, canvas.width);
    }

    ctx.restore();
  };

  // Zoom-Logik
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomLevel.current = Math.min(3, zoomLevel.current + 0.1); // Heranzoomen (Maximal 3x)
      } else {
        zoomLevel.current = Math.max(1, zoomLevel.current - 0.1); // Herauszoomen (Minimal 1x)
      }
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

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

  // const drawBackground = (ctx, camera, boundaries) => {
  //     const canvas = canvasRef.current;
  //     const hexSize = 30; // Größe der Hexagone
  //     const gap = 2; // Abstand zwischen Hexagonen
  //     const hexWidth = Math.sqrt(3) * hexSize; // Breite eines Hexagons
  //     const hexHeight = 2 * hexSize; // Höhe eines Hexagons
  //     const offset = 0.5 * hexWidth; // Versatz für jede zweite Reihe
  //
  //     // // Hintergrundfarbe
  //     // ctx.fillStyle = '#1b1f2a'; // Dunkles Blau
  //     // ctx.fillRect(0, 0, canvas.width, canvas.height);
  //
  //     // Bereiche außerhalb der Boundary rot einfärben
  //     ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Halbtransparentes Rot
  //     // Links
  //     ctx.fillRect(0, 0, -camera.x, canvas.height); // Bereich links der Spielfeldgrenze
  //     // Rechts
  //     ctx.fillRect(boundaries.width - camera.x, 0, canvas.width - boundaries.width + camera.x, canvas.height);
  //     // Oben
  //     ctx.fillRect(0, 0, canvas.width, -camera.y); // Bereich oberhalb der Spielfeldgrenze
  //     // Unten
  //     ctx.fillRect(0, boundaries.height - camera.y, canvas.width, canvas.height - boundaries.height + camera.y);
  //
  //
  //     // Hexagon-Muster über die gesamte Spielfeldgröße zeichnen
  //     const startX = -hexWidth; // Start vor der linken Grenze
  //     const endX = boundaries.width + hexWidth; // Bis nach der rechten Grenze
  //     const startY = -hexHeight; // Start vor der oberen Grenze
  //     const endY = boundaries.height + hexHeight; // Bis nach der unteren Grenze
  //
  //     for (let y = startY; y < endY; y += hexHeight * 0.75) {
  //         for (let x = startX; x < endX; x += hexWidth) {
  //             const xOffset = (Math.floor(y / (hexHeight * 0.75)) % 2 === 0) ? 0 : offset;
  //             drawHexagon(ctx, x + xOffset - camera.x, y - camera.y, hexSize, gap);
  //         }
  //     }
  //
  //
  //     // Boundary (Grenze) rot zeichnen
  //     ctx.strokeStyle = 'red';
  //     ctx.lineWidth = 3;
  //     ctx.strokeRect(-camera.x, -camera.y, boundaries.width, boundaries.height);
  //
  // };

//     const drawHexagon = (ctx, x, y, size, gap) => {
//         const side = size - gap; // Berücksichtige den Abstand
//         ctx.beginPath();
//         for (let i = 0; i < 6; i++) {
//             const angle = (Math.PI / 3) * i; // 60° für jedes Hexagon
//             const xPos = x + side * Math.cos(angle);
//             const yPos = y + side * Math.sin(angle);
//             if (i === 0) {
//                 ctx.moveTo(xPos, yPos);
//             } else {
//                 ctx.lineTo(xPos, yPos);
//             }
//         }
//         ctx.closePath();
//         ctx.fillStyle = '#2a2f3c'; // Hexagon-Füllfarbe (etwas heller als der Hintergrund)
//         ctx.fill();
//         ctx.strokeStyle = '#101318'; // Hexagon-Randfarbe
//         ctx.lineWidth = 1.5; // Breite des Randes
//         ctx.stroke();
//     };

  // setInterval(() => {
  //     if (otherSnakes) {
  //         Object.values(otherSnakes).forEach(snake => {
  //             snake.moveSnake(boundaries.current);
  //         });
  //     }
  // }   , 100);

  useEffect(() => {
    let animationFrameId; // Speichert die ID des aktuellen Frames

    const loop = () => {
      render(); // Render-Funktion ausführen
      animationFrameId = requestAnimationFrame(loop); // Nächsten Frame planen
    };

    loop(); // Schleife starten

    return () => cancelAnimationFrame(animationFrameId); // Schleife beim Unmount stoppen
  }, [otherSnakes, food, currentEquation, showScores]); // Keine zusätzlichen Abhängigkeiten

  // Füge Event-Listener hinzu
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

  // const getCameraPosition = (snakeHead, viewportWidth, viewportHeight, zoomLevel) => {
  //     // Calculate the camera position centered on the snake's head
  //     let cameraX = snakeHead.x - (viewportWidth / (2 * zoomLevel));
  //     let cameraY = snakeHead.y - (viewportHeight / (2 * zoomLevel));
  //
  //     return {x: cameraX, y: cameraY};
  // };

  return (
      <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
          }}
      />
  );
};

export default GameCanvas;
