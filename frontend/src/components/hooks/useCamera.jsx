// hooks/useCamera.jsx
import {useCallback} from "react";

const useCamera = () => {
  return useCallback(
      (snakeHead, zoomLevel, viewport) => {
        let cameraX = snakeHead.x - viewport.width / (2 * zoomLevel);
        let cameraY = snakeHead.y - viewport.height / (2 * zoomLevel);
        return {x: cameraX, y: cameraY};
      },
      []
  );
};

export default useCamera;
