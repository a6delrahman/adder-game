import {useCallback} from "react";

const useMouseMovement = (canvasRef, boundaries, playerSnakeId, sendMovementData, zoomLevel) => {
  return useCallback(
      (e) => {
        if (!canvasRef) return;

        const canvas = canvasRef;
        const rect = canvas.getBoundingClientRect();

        // Berechne Mausposition relativ zum Canvas
        const mouseX = (e.clientX - rect.left) / zoomLevel;
        const mouseY = (e.clientY - rect.top) / zoomLevel;

        // Hole die Kamera-Position
        const camera = {
          x: boundaries.x || 0,
          y: boundaries.y || 0,
        };

        const targetX = mouseX + camera.x;
        const targetY = mouseY + camera.y;

        // Sende die Bewegungsdaten an den Server
        sendMovementData(playerSnakeId, targetX, targetY);
      },
      [canvasRef, playerSnakeId, sendMovementData, zoomLevel, boundaries.x,
        boundaries.y]
  );
};

export default useMouseMovement;
