const drawOvalForm = (ctx, segment, scale, elongation = 1.5, angle = 0) => {
  // elongation bestimmt das Verhältnis von Breite zu Höhe (z. B. 1.5 für länglicheres Segment)
  const radiusX = scale; // Horizontale Ausdehnung
  const radiusY = scale / elongation; // Vertikale Ausdehnung

  ctx.beginPath();
  // Zeichne eine Ellipse mit der gegebenen Rotation
  ctx.ellipse(segment.x, segment.y, radiusX, radiusY, angle, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
};

export default drawOvalForm;
