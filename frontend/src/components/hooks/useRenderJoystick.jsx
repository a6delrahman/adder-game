import { useState } from "react";

const useRenderJoystick = () => {
  const [colorOuterRing, setColorOuterRing] = useState('rgba(255, 255, 255, 0.5)');
  const [joystickState, setJoystickState] = useState({
    isActive: false,
    centerX: 0,
    centerY: 0,
    currentX: 0,
    currentY: 0,
  });

  const handleJoystickStart = (centerX, centerY) => {
    setJoystickState({
      isActive: true,
      centerX,
      centerY,
      currentX: centerX,
      currentY: centerY,
    });
    setColorOuterRing('rgba(255, 255, 255, 0.5)'); // Standardfarbe bei Start
  };

  const handleJoystickMove = (currentX, currentY) => {
    const { centerX, centerY } = joystickState;

    const deltaX = currentX - centerX;
    const deltaY = currentY - centerY;

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const angle = Math.atan2(deltaY, deltaX);

    const maxDistance = 100; // Maximale Joystick-Reichweite (Radius)
    const intensity = Math.min(distance / maxDistance, 1);

    // Ändere die Farbe basierend auf der Intensität
    if (intensity > 0.8) {
      setColorOuterRing('rgba(255, 0, 0, 0.8)'); // Rot, wenn Boost aktiv
    } else {
      setColorOuterRing('rgba(255, 255, 255, 0.5)'); // Weiß, wenn Boost inaktiv
    }

    setJoystickState((prev) => ({
      ...prev,
      currentX: centerX + Math.cos(angle) * Math.min(distance, maxDistance),
      currentY: centerY + Math.sin(angle) * Math.min(distance, maxDistance),
    }));

    return { angle, intensity }; // Zurückgeben für Bewegungs-Handling
  };

  const handleJoystickEnd = () => {
    setJoystickState((prev) => ({
      ...prev,
      isActive: false,
    }));
  };

  const updateJoystickCenter = (snakeHeadX, snakeHeadY, cameraX, cameraY, zoomLevel) => {
    // Berechne die Position des Schlangenkopfs relativ zum Canvas
    const canvasHeadX = (snakeHeadX - cameraX) * zoomLevel;
    const canvasHeadY = (snakeHeadY - cameraY) * zoomLevel;

    setJoystickState((prev) => ({
      ...prev,
      centerX: canvasHeadX,
      centerY: canvasHeadY,
    }));
  };

  const renderJoystick = (ctx) => {
    if (!joystickState.isActive) return;

    const { centerX, centerY, currentX, currentY } = joystickState;
    const outerRadius = 100;
    const innerRadius = 40;

    // Äußerer Kreis
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = colorOuterRing;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Innerer Kreis
    ctx.beginPath();
    ctx.arc(currentX, currentY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  };

  return {
    handleJoystickStart,
    handleJoystickMove,
    handleJoystickEnd,
    updateJoystickCenter,
    renderJoystick,
  };
};

export default useRenderJoystick;
