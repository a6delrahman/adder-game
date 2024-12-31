const drawDefaultForm  = (ctx, segment, scale) => {
  return ctx.arc(segment.x, segment.y, scale, 0, 2 * Math.PI);
};

export default drawDefaultForm;

