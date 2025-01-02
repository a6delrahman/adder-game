// GameCanvas.jsx

import {memo, useCallback, useEffect, useRef} from 'react';
import useWebSocket from "../hooks/useWebSocket.jsx";
import useRenderJoystick from "../hooks/useRenderJoystick.jsx";
import useRenderSnakes from "../hooks/useRenderSnakes.jsx";
import useRenderFood from "../hooks/useRenderFood2.jsx";
import useRenderScores from "../hooks/useRenderScores.jsx";
import useRenderMathEquations from "../hooks/useRenderMathEquations.jsx";
import useCamera from "../hooks/useCamera.jsx";
import {
  createBackgroundCanvas
} from "../../canvas/drawings/backgrounds/createBackgroundCanvas4.js";

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
        currentEquation,
        toggleSound,
        isSoundEnabled,
      } = useWebSocket(); // Zugriff auf den zentralisierten Zustand
      const zoomLevel = useRef(4); // Start-Zoomlevel (1.5 = 150%)

      // Joystick Hook
      const {
        handleJoystickStart,
        handleJoystickMove,
        handleJoystickEnd,
        renderJoystick,
      } = useRenderJoystick();

      // Custom Hooks
      const renderSnakes = useRenderSnakes(playerSnakeId, otherSnakes);
      const renderFood = useRenderFood(food);
      const renderScores = useRenderScores(playerSnakeId, otherSnakes);
      const renderMathEquations = useRenderMathEquations(currentEquation.equation);
      const getCameraPosition = useCamera();


      const showScoresRef = useRef(true); // Ref für Scores-Anzeige

      const toggleScores = () => showScoresRef.current = !showScoresRef.current;

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

        prepareBackground().catch(console.error); // Hintergrund vorbereiten
      }, [boundaries]);

      const calculateVector = (start, end) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        return {
          x: magnitude > 0 ? dx / magnitude : 0,
          y: magnitude > 0 ? dy / magnitude : 0
        };
      };

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

      const sendDirection = (direction) => {
        const payload = {
          snakeId: playerSnakeId,
          direction,
          boost: boost.current,
        }
        sendMessage({
          type: 'change_direction',
          payload: payload
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

        renderSnakes(ctx); // Draw snakes

        renderFood(ctx); // Draw food

        // Overlays zeichnen (Scores und MathEquations)
        ctx.restore(); // Rückkehr zur ursprünglichen Position ohne Zoom
        ctx.save();


        renderJoystick(ctx); // Joystick zeichnen

        if (currentEquation) {
          renderMathEquations(ctx); // MathEquations (oben zentriert)
        }


        if (showScoresRef.current) {
          renderScores(ctx, canvas.width); // Scores (oben links)
        }

        ctx.restore();
      };

  // const render = useCallback(() => {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext('2d');
  //   const ownSnake = otherSnakes[playerSnakeId];
  //
  //   if (!ownSnake) {
  //     return;
  //   }
  //
  //   // Camera position
  //   const camera = getCameraPosition(
  //       ownSnake.headPosition,
  //       zoomLevel.current,
  //       { width: canvas.width, height: canvas.height }
  //   );
  //
  //   ctx.save();
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //
  //   ctx.scale(zoomLevel.current, zoomLevel.current);
  //   ctx.translate(-camera.x, -camera.y);
  //
  //   const backgroundCanvas = backgroundCanvasRef.current;
  //   if (backgroundCanvas) {
  //     ctx.drawImage(
  //         backgroundCanvas,
  //         0,
  //         0,
  //         boundaries.current.width,
  //         boundaries.current.height
  //     );
  //   }
  //
  //   renderSnakes(ctx);
  //   renderFood(ctx);
  //
  //   ctx.restore();
  //   ctx.save();
  //
  //   renderJoystick(ctx);
  //
  //   if (currentEquation) {
  //     renderMathEquations(ctx);
  //   }
  //
  //   if (showScoresRef.current) {
  //     renderScores(ctx, canvas.width);
  //   }
  //
  //   ctx.restore();
  // }, [
  //   canvasRef,
  //   otherSnakes,
  //   playerSnakeId,
  //   zoomLevel,
  //   getCameraPosition,
  //   backgroundCanvasRef,
  //   boundaries,
  //   currentEquation,
  //   showScoresRef,
  //   renderSnakes,
  //   renderFood,
  //   renderJoystick,
  //   renderMathEquations,
  //   renderScores,
  // ]); // Fügen Sie hier alle Abhängigkeiten hinzu, die in `render` verwendet werden

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

        window.addEventListener('wheel', handleWheel, {passive: false});

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
      }, [handleJoystickMove, render]); // Keine zusätzlichen Abhängigkeiten

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

      useEffect(() => {
        const canvas = canvasRef.current;

        const handleTouchStart = (e) => {
          const touch = e.touches[0];
          const rect = canvas.getBoundingClientRect();
          const startX = touch.clientX - rect.left;
          const startY = touch.clientY - rect.top;

          handleJoystickStart(startX, startY); // Joystick aktivieren
        };

        const handleTouchMove = (e) => {
          const touch = e.touches[0];
          const rect = canvas.getBoundingClientRect();
          const moveX = touch.clientX - rect.left;
          const moveY = touch.clientY - rect.top;

          const {angle, intensity} = handleJoystickMove(moveX, moveY);

          // Bewegung der Schlange berechnen und senden
          const direction = {
            x: Math.cos(angle),
            y: Math.sin(angle),
          };

          if (intensity < 0.8) {
            boost.current = false;
            otherSnakes[playerSnakeId].setBoost(false);
          } else {
            boost.current = true;
            otherSnakes[playerSnakeId].setBoost(true);
          }

          sendMessage({
            type: "change_direction",
            payload: {snakeId: playerSnakeId, direction, boost: boost.current},
          });
        };

        const handleTouchEnd = () => {
          handleJoystickEnd(); // Joystick deaktivieren
          boost.current = false; // Boost zurücksetzen
          otherSnakes[playerSnakeId].setBoost(false);
        };

        canvas.addEventListener("touchstart", handleTouchStart, {passive: false});
        canvas.addEventListener("touchmove", handleTouchMove, {passive: false});
        canvas.addEventListener("touchend", handleTouchEnd, {passive: false});

        return () => {
          canvas.removeEventListener("touchstart", handleTouchStart);
          canvas.removeEventListener("touchmove", handleTouchMove);
          canvas.removeEventListener("touchend", handleTouchEnd);
        };
      }, [handleJoystickStart, handleJoystickMove]);

      return (
          <div>
            <div>
              <button
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '10px',
                    backgroundColor: "black",
                    color: 'white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    zIndex: 10, // Über dem Canvas
                  }}
                  onClick={toggleSound}
              >
                {isSoundEnabled ? 'Sound: On' : 'Sound: Off'}
              </button>
            </div>

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
                  zIndex: 1, // Über dem Canvas
                }}
            />
          </div>
      )
    }
;

export default memo(GameCanvas);
