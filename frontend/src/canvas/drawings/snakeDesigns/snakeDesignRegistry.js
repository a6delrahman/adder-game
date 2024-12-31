// src/canvas/drawings/snakeDesigns/snakeDesignRegistry.js
const designRegistry = {};

// Registrierung eines neuen Dekorators
export const registerSnakeDecorator = (name, decoratorFunction) => {
  if (!name || typeof decoratorFunction !== 'function') {
    throw new Error('Invalid decorator registration');
  }
  if (!designRegistry[name]) {
    designRegistry[name] = [];
  }
  designRegistry[name].push(decoratorFunction);
};

// Kombiniert alle Dekoratoren eines Designs
export const getCombinedSnakeDecorators = (designs = []) => {
  const combined = designs.flatMap((design) => designRegistry[design] || []);
  return (snake, ctx) => combined.forEach((decorator) => decorator(snake, ctx));
};

// Design-Strings zentral verwalten
export const DesignNames = {
  HEAD_HIGHLIGHT: 'headHighlight',
  SHADOW: 'shadow',
  NEON_GLOW: 'neonGlow',
  DOUBLE: 'double',
  REALISTIC: 'realistic',
  CLASSIC: 'classic',
  MODERN: 'modern',
  NEON: 'neon',
  DEFAULT: 'default',
  OVAL_FORM: 'ovalForm',
  SCALES: 'scales',
};
