import drawHexagonPattern from "./drawHexagon";

export const createBackgroundCanvas = (imageSrc, boundaries) => {
  const backgroundCanvas = document.createElement("canvas");
  const backgroundCtx = backgroundCanvas.getContext("2d");

  const { width, height } = boundaries;

  // Passe das Canvas an die Spielfeldgröße an
  backgroundCanvas.width = width;
  backgroundCanvas.height = height;

  // Lade das Hintergrundbild
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve) => {
    image.onload = () => {
      // Zeichne das Bild auf das Offscreen-Canvas
      backgroundCtx.drawImage(image, 0, 0, width, height);

      // Zeichne das Hexagon-Muster
      drawHexagonPattern(backgroundCtx, width, height);

      // Gebe das vorbereitete Canvas zurück
      resolve(backgroundCanvas);
    };

    image.onerror = () => {
      console.error("Fehler beim Laden des Hintergrundbildes:", imageSrc);
      resolve(null); // Im Fehlerfall ein leeres Canvas zurückgeben
    };
  });
};
