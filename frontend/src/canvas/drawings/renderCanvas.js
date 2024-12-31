export const renderCanvas = (ctx, canvas, ownSnake, playerSnakeId, zoomLevel, options) => {
  // const canvas = canvasRef.current;
  // const ctx = canvas.getContext("2d");
  const {
    backgroundCanvasRef,
    showScores,
    getCameraPosition,
    currentEquation,
    renderSnakes,
    renderFoods,
    renderScores,
    renderMathEquations
  } = options;

  // const ownSnake = otherSnakes[playerSnakeId];
  //
  //
  // Calculate the camera position based on the snake's head and zoom level
  const camera = getCameraPosition(
      ownSnake.headPosition,
      zoomLevel.current,
      {width: canvas.width, height: canvas.height}
  );





  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);


  const backgroundCanvas = backgroundCanvasRef.current;
  // Hintergrund rendern
  if (backgroundCanvas) {
    ctx.drawImage(backgroundCanvas, 0, 0);
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (renderSnakes) {
    renderSnakes(ctx);
  }

  if (renderFoods) {
    renderFoods(ctx);
  }

  ctx.restore();
  ctx.save();

  // Overlay (Scores und Matheaufgaben)
  // MathEquations (oben zentriert)
  if (renderMathEquations && currentEquation) {
    renderMathEquations(ctx);
  }

  // Scores (oben links)
  if (renderScores && showScores) {
    renderScores(ctx, canvas.width);
  }

  ctx.restore();

  return ctx;
};
