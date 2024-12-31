// GameCanvas.jsx

import React, {memo, useEffect, useRef, useState} from 'react';
import {useWebSocket} from '../../context/WebSocketContext';
import useRenderSnakes from "../hooks/useRenderSnakes.jsx";
import useRenderFood from "../hooks/useRenderFood2.jsx";
import useRenderScores from "../hooks/useRenderScores.jsx";
import useRenderMathEquations from "../hooks/useRenderMathEquations.jsx";
import useCamera from "../hooks/useCamera.jsx";
import {
  createBackgroundCanvas
} from "../../canvas/drawings/backgrounds/createBackgroundCanvas4.js";
import {drawSnake} from "../../canvas/drawings/snakeDesigns/drawSnake.js";
import useRenderSnakes2 from "../hooks/useRenderSnakes2.jsx";

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
  const zoomLevel = useRef(4); // Start-Zoomlevel (1.5 = 150%)

  // Custom Hooks
  const renderSnakes = useRenderSnakes(playerSnakeId, otherSnakes);
  const renderSnakes2 = useRenderSnakes2(playerSnakeId, otherSnakes);
  const renderFood = useRenderFood(food);
  const renderScores = useRenderScores(otherSnakes);
  const renderMathEquations = useRenderMathEquations(currentEquation.equation);
  const getCameraPosition = useCamera();
  // const handleMouseMove = useMouseMovement(canvasRef, boundaries, playerSnakeId, sendMovementData, zoomLevel);

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

  // Hintergrund vorbereiten
  useEffect(() => {
    const prepareBackground = async () => {
      backgroundCanvasRef.current = await createBackgroundCanvas(
          boundaries.current, "/src/assets/cosmos.jpg",
      ); // Speichere das vorbereitete Canvas
    };

    prepareBackground();
  }, [boundaries]);

  const calculateVector = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    return {
      x: magnitude > 0 ? dx / magnitude : 0,
      y: magnitude > 0 ? dy / magnitude : 0
    };
  }

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

    const direction = calculateVector(ownSnake.headPosition,
        {x: targetX, y: targetY});
    const payload = {
      snakeId: playerSnakeId,
      direction,
      boost: boost.current,
    }
    sendMessage({
      type: 'change_direction',
      payload: payload,
    });
  };

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

    renderSnakes(ctx,["realisticScales"]); // Draw snakes
    renderSnakes2(ctx);

    // Object.values(otherSnakes).forEach((snake) => {
    //   drawSnake(ctx, snake, Date.now() % 60); // Zeichne jede Schlange
    // });
    renderFood(ctx); // Draw food

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
        zoomLevel.current = Math.min(6, zoomLevel.current + 0.1); // Heranzoomen (Maximal 3x)
      } else {
        zoomLevel.current = Math.max(0.5, zoomLevel.current - 0.1); // Herauszoomen (Minimal 1x)
      }
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

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
        otherSnakes[playerSnakeId].setBoost(true);
        sendMovementData(e.clientX, e.clientY);
      }
    };
    const handleMouseUp = (e) => {
      if (e.button === 0) {
        boost.current = false;
        otherSnakes[playerSnakeId].setBoost(false);
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
            backgroundColor: 'rgb(118,186,219)',
          }}
      />
  );
};

export default memo(GameCanvas);
