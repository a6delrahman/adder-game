// shared/classes/Snake.js
class Snake {
  constructor(snakeData) {
    if (typeof snakeData === 'object') {
      this.snakeId = snakeData.snakeId || '';
      this.name = snakeData.name || '';
      this.headPosition = snakeData.headPosition || {x: 0, y: 0};
      this.targetPosition = snakeData.targetPosition;
      this.direction = snakeData.direction || {x: 0.5, y: 0.5};
      this.segments = snakeData.segments || [];
      this.segmentCount = snakeData.segmentCount || 20;
      this.scale = snakeData.scale || 3;
      this.color = snakeData.color || 'green';
      this.secondColor = snakeData.secondColor || 'black';
      this.speed = snakeData.speed || 1;
      this.SNAKE_INITIAL_LENGTH = snakeData.SNAKE_INITIAL_LENGTH || 20;
      this.boost = snakeData.boost || false;
      this.currentEquation = snakeData.currentEquation || '';
      this.score = snakeData.score || 0;
      this.eatenFood = snakeData.eatenFood || 0;
      this.correctAnswers = snakeData.correctAnswers || 0;
      this.wrongAnswers = snakeData.wrongAnswers || 0;
    } else {
      const [snakeId, headPosition, targetPosition, options = {}] = arguments;
      this.snakeId = snakeId;
      this.name = options.name;
      this.headPosition = headPosition;
      this.targetPosition = targetPosition;
      this.direction = {x: 0.5, y: 0.5};
      this.segments = [];
      this.segmentCount = options.segmentCount || 20;
      this.scale = options.scale || 3;
      this.color = options.color || 'green';
      this.secondColor = options.secondColor || 'black';
      this.speed = options.speed || 1;
      this.SNAKE_INITIAL_LENGTH = 20;
      this.boost = false;
      this.currentEquation = {};
      this.score = 0;
      this.eatenFood = 0;
      this.correctAnswers = 0;
      this.wrongAnswers = 0;
    }
  }

  calculateScale() {
    // Berechnung des Scales basierend auf der Punktzahl
    const baseScale = 3; // Basisgröße der Schlange
    const scaleFactor = 0.1; // Skalierungsfaktor
    return baseScale + this.score * scaleFactor;
  }

  updateScore(score) {
    this.score = score;
    this.scale = this.calculateScale(); // Aktualisiere den Scale, wenn der Score geändert wird
  }

  correctAnswer() {
    this.correctAnswers++;
  }

  wrongAnswer() {
    this.wrongAnswers++;
  }

  foodEaten() {
    this.eatenFood++;
  }

  update(headPosition, segments) {
    this.headPosition = headPosition;
    this.segments = segments;
  }

  updateEquation(equation) {
    this.currentEquation = equation
  }

  updateDirection(direction) {
    this.direction = direction;
  }

  moveSnake(boundaries) {
    // Berechne die Geschwindigkeit
    const speed = this.boost ? this.speed * 2 : this.speed;

    // Aktualisiere die Kopfposition basierend auf Richtung und Geschwindigkeit
    this.headPosition.x += this.direction.x * speed;
    this.headPosition.y += this.direction.y * speed;

    // Begrenze die Kopfposition innerhalb der Spielfeldgrenzen
    this.headPosition.x = Math.max(0,
        Math.min(this.headPosition.x, boundaries.width));
    this.headPosition.y = Math.max(0,
        Math.min(this.headPosition.y, boundaries.height));

    // Füge ein neues Segment für die neue Kopfposition hinzu
    this.segments.unshift({...this.headPosition});
    // Entferne ältere Segmente, wenn die maximale Länge überschritten wird
    const maxSegments = Math.max(this.segmentCount, this.SNAKE_INITIAL_LENGTH);
    if (this.segments.length > maxSegments) {
      this.segments.pop();
    }
    // Entferne mehrere Segmente, wenn ein abrupter Punkteabzug erfolgte
    if (this.segments.length > maxSegments) {
      const segmentsToRemove = this.segments.length - maxSegments;
      const segmentsToRemoveInThisIteration = Math.ceil(segmentsToRemove / 6);
      for (let i = 0; i < segmentsToRemoveInThisIteration; i++) {
        this.segments.pop();
      }
    }
  }



  static visible(snake, camera) {
    const {x, y} = snake.headPosition;
    const {width, height} = camera;
    return x >= 0 && x <= width && y >= 0 && y <= height;
  }

  setBoost(boostActive) {
    // console.log(`Setting boost for snake ${this.snakeId}: ${boostActive}`);
    this.boost = boostActive;
  }

  applyBoostPenalty(pointsToDrop) {
    if (this.boost && this.segments.length > this.SNAKE_INITIAL_LENGTH) {
      // this.boost = false; // Deaktiviere Boost, wenn Punkte abgezogen werden
      return this.segments.splice(-1, 1).map(segment => ({
        x: segment.x,
        y: segment.y,
        points: pointsToDrop,
      }));
    }
    return [];
  }

  checkCollisionWith(otherSnake) {
    if (this === otherSnake) {
      return false;
    } // Stelle sicher, dass die Schlange nicht mit sich selbst verglichen wird

    const collisionRadius = 10; // Genauere Kollisionsdistanz definieren

    // Überprüfe Kollision zwischen dem Kopf der eigenen Schlange und den Segmenten der anderen
    return otherSnake.segments.some(segment =>
        Math.hypot(segment.x - this.headPosition.x,
            segment.y - this.headPosition.y) < collisionRadius
    );
  }

  checkCollisionWithFood(food) {
    return Math.hypot(this.headPosition.x - food.x,
        this.headPosition.y - food.y) < 10;
  }

  // 1. Segment-Gradient-Farben
  draw(ctx) {
    this.segments.forEach((segment, index) => {
      // Überprüfen, ob die Werte gültig sind
      if (
          !Number.isFinite(segment.x) ||
          !Number.isFinite(segment.y) ||
          !Number.isFinite(this.scale)
      ) {
        console.error(`Ungültige Werte für Segment:`,
            {segment, scale: this.scale});
        return;
      }

      // Erstelle den Farbverlauf für das Segment
      const gradient = ctx.createRadialGradient(
          segment.x,
          segment.y,
          0,
          segment.x,
          segment.y,
          this.scale
      );
      gradient.addColorStop(0, this.color); // Startfarbe
      gradient.addColorStop(1, 'black'); // Endfarbe

      // Schattierung
      ctx.shadowColor = 'rgb(255,255,255)'; // Farbe des Schattens
      ctx.shadowBlur = 2; // Weichheit des Schattens
      ctx.shadowOffsetX = 2; // Horizontaler Offset
      ctx.shadowOffsetY = 3; // Vertikaler Offset

      // Zeichne das Segment
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, this.scale, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
}

module.exports = Snake;



