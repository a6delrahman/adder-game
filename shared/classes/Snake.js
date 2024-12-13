// shared/classes/Snake.js
class Snake {
    constructor(snakeData) {
        if (typeof snakeData === 'object') {
            this.snakeId = snakeData.snakeId || '';
            this.headPosition = snakeData.headPosition || {x: 0, y: 0};
            this.targetPosition = snakeData.targetPosition;
            this.segments = snakeData.segments || [];
            this.segmentCount = snakeData.segmentCount || 5;
            this.scale = snakeData.scale || 0.6;
            this.color = snakeData.color || 'green';
            this.speed = snakeData.speed || 2;
            this.SNAKE_INITIAL_LENGTH = snakeData.SNAKE_INITIAL_LENGTH || 20;
            this.queuedSegments = snakeData.queuedSegments || 0;
            this.boost = snakeData.boost || false;
        } else {
            const [snakeId, headPosition, targetPosition, options = {}] = arguments;
            this.snakeId = snakeId;
            this.headPosition = headPosition;
            this.targetPosition = targetPosition;
            this.segments = [];
            this.segmentCount = options.segmentCount || 5;
            this.scale = options.scale || 0.6;
            this.color = options.color || 'green';
            this.speed = options.speed || 2;
            this.SNAKE_INITIAL_LENGTH = 20;
            this.queuedSegments = 0;
            this.boost = false;

            // Initialize segments
            for (let i = 0; i < this.segmentCount; i++) {
                this.segments.push({headPosition});
            }
        }
        this.isBrowser = typeof window !== 'undefined';
        // Lade die Textur nur im Browser
        if (this.isBrowser) {
            this.texture = new Image();
            this.texture.src = '/public/images/texture.png'; // Relativer Pfad zur Textur
        }

    }



    // updatePosition(segments) {
    //     this.segments = segments;
    //     // const newsegment = Array.from({ length: this.segmentCount }, (_, i) => ({ x: this.position.x, y: this.position.y + i * this.speed }))
    //     // this.segments = newsegment;
    // }


    updatePosition(targetX, targetY) {
        // Update the head position
        const head = this.segments[0];
        head.x += (targetX - head.x) * this.speed;
        head.y += (targetY - head.y) * this.speed;

        // Update the rest of the segments
        for (let i = 1; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const prevSegment = this.segments[i - 1];
            segment.x += (prevSegment.x - segment.x) * this.speed;
            segment.y += (prevSegment.y - segment.y) * this.speed;
        }
    }


    // updatePositionLocal(targetX, targetY) {
    //     // Update the head position
    //     const head = this.segments[0];
    //     head.x += (targetX - head.x) * this.speed;
    //     head.y += (targetY - head.y) * this.speed;
    //
    //     // Update the rest of the segments
    //     for (let i = 1; i < this.segments.length; i++) {
    //         const segment = this.segments[i];
    //         const prevSegment = this.segments[i - 1];
    //         segment.x += (prevSegment.x - segment.x) * this.speed;
    //         segment.y += (prevSegment.y - segment.y) * this.speed;
    //     }
    // }

    update(headPosition, segments) {
        this.headPosition = headPosition;
        this.segments = segments;
    }

    updateDirection(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
    }

    moveSnake() {
        // First, the function calculates the difference between the target position and the current head position of the snake:
        const dx = this.targetX - this.headPosition.x;
        const dy = this.targetY - this.headPosition.y;

        // Next, it normalizes the direction vector to ensure the movement is consistent regardless of the distance to the target:
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        const directionX = magnitude > 0 ? dx / magnitude : 0;
        const directionY = magnitude > 0 ? dy / magnitude : 0;

        // // The speed of the snake is then determined, doubling if the boost is active:
        const speed = this.boost ? this.speed * 2 : this.speed;

        // The head position of the snake is updated based on the direction and speed:
        this.headPosition.x += directionX * speed;
        this.headPosition.y += directionY * speed;

        // To ensure the snake stays within the game boundaries, the new head position is clamped:
        this.headPosition.x = Math.max(0, Math.min(this.headPosition.x, 800));
        this.headPosition.y = Math.max(0, Math.min(this.headPosition.y, 600));

        // A new segment is added to the front of the snake to represent the new head position:
        this.segments.unshift({...this.headPosition});

        // Finally, if the number of segments exceeds the maximum allowed (initial length plus any queued segments), the oldest segment is removed:
        const maxSegments = this.segmentCount + this.queuedSegments;
        if (this.segments.length > maxSegments) {
            this.segments.pop();
        }
    }

    static visible(snake, camera) {
        const {x, y} = snake.position;
        const {width, height} = camera;
        return x >= 0 && x <= width && y >= 0 && y <= height;
    }

    setBoost(boostActive) {
        console.log(`Setting boost for snake ${this.snakeId}: ${boostActive}`);
        this.boost = boostActive;
    }

    applyBoostPenalty(pointsToDrop) {
        if (this.boost && pointsToDrop > 0) {
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
        return this.segments.some(segment =>
            Math.hypot(segment.x - otherSnake.headPosition.x, segment.y - otherSnake.headPosition.y) < 10
        );
    }

    checkCollisionWithFood(food) {
        return Math.hypot(this.headPosition.x - food.x, this.headPosition.y - food.y) < 10;
    }




    // // 1. Segment-Gradient-Farben
    // draw(ctx) {
    //     this.segments.forEach((segment, index) => {
    //         // Überprüfen, ob die Werte gültig sind
    //         if (
    //             !Number.isFinite(segment.x) ||
    //             !Number.isFinite(segment.y) ||
    //             !Number.isFinite(this.scale)
    //         ) {
    //             console.error(`Ungültige Werte für Segment:`, { segment, scale: this.scale });
    //             return;
    //         }
    //
    //         // Erstelle den Farbverlauf für das Segment
    //         const gradient = ctx.createRadialGradient(
    //             segment.x,
    //             segment.y,
    //             0,
    //             segment.x,
    //             segment.y,
    //             10 * this.scale
    //         );
    //         gradient.addColorStop(0, this.color); // Startfarbe
    //         gradient.addColorStop(1, 'black'); // Endfarbe
    //
    //         // // Schattierung
    //         // ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Farbe des Schattens
    //         // ctx.shadowBlur = 15; // Weichheit des Schattens
    //         // ctx.shadowOffsetX = 3; // Horizontaler Offset
    //         // ctx.shadowOffsetY = 3; // Vertikaler Offset
    //
    //
    //
    //         // Zeichne das Segment
    //         ctx.fillStyle = gradient;
    //         ctx.beginPath();
    //         ctx.arc(segment.x, segment.y, 10 * this.scale, 0, 2 * Math.PI);
    //         ctx.fill();
    //     });
    // }

    // // 3. Kopf-Segment hervorheben
    // draw(ctx) {
    //     for (let i = 0; i < this.segments.length; i++) {
    //         const segment = this.segments[i];
    //
    //         if (i === 0) {
    //             // Kopf-Segment
    //             ctx.fillStyle = 'yellow'; // Auffällige Farbe für den Kopf
    //         } else {
    //             ctx.fillStyle = this.color;
    //         }
    //
    //         ctx.beginPath();
    //         ctx.arc(segment.x, segment.y, 10 * this.scale, 0, 2 * Math.PI);
    //         ctx.fill();
    //     }
    // }


    // 4. Animation durch pulsierende Segmente
    draw(ctx) {
        const timeFactor = Math.sin(Date.now() / 200); // Animationsfaktor

        this.segments.forEach((segment, index) => {
            const scaleFactor = 1 + (timeFactor * (index / this.segments.length) * 0.1); // Leichtes Pulsieren
            ctx.fillStyle = this.color;

            ctx.beginPath();
            ctx.arc(segment.x, segment.y, 10 * this.scale * scaleFactor, 0, 2 * Math.PI);
            ctx.fill();
        });




    // // 5. Texturierte Segmente
    // draw(ctx) {
    //     if (!this.isBrowser) {
    //         return; // Kein Rendering im Backend
    //     }
    //
    //     this.segments.forEach(segment => {
    //         if (this.texture && this.texture.complete) {
    //             ctx.drawImage(this.texture, segment.x - 10, segment.y - 10, 20, 20);
    //         } else {
    //             ctx.fillStyle = this.color;
    //             ctx.beginPath();
    //             ctx.arc(segment.x, segment.y, 10 * this.scale, 0, 2 * Math.PI);
    //             ctx.fill();
    //         }
    //     });


    // // 6. Körperform verbessern
    // draw(ctx) {
    //     this.segments.forEach((segment, index) => {
    //         ctx.fillStyle = this.color;
    //
    //         ctx.beginPath();
    //         ctx.ellipse(segment.x, segment.y, 12 * this.scale, 8 * this.scale, 0, 0, 2 * Math.PI);
    //         ctx.fill();
    //     });
    // }

    // // 7. Transparenz hinzufügen
    // draw(ctx) {
    //     this.segments.forEach((segment, index) => {
    //         const alpha = 1 - index / this.segments.length; // Transparenz basierend auf der Position
    //         ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`; // Transparente grüne Farbe
    //
    //         ctx.beginPath();
    //         ctx.arc(segment.x, segment.y, 10 * this.scale, 0, 2 * Math.PI);
    //         ctx.fill();
    //     });
    // }

    //
    // // Code mit einem größeren, schlangenartigen Kopf
    // draw(ctx) {
    //     this.segments.forEach((segment, index) => {
    //         // Überprüfen, ob die Werte gültig sind
    //         if (
    //             !Number.isFinite(segment.x) ||
    //             !Number.isFinite(segment.y) ||
    //             !Number.isFinite(this.scale)
    //         ) {
    //             console.error(`Ungültige Werte für Segment:`, { segment, scale: this.scale });
    //             return;
    //         }
    //
    //         if (index === 0) {
    //             // Der Kopf der Schlange
    //             const headGradient = ctx.createRadialGradient(
    //                 segment.x,
    //                 segment.y,
    //                 0,
    //                 segment.x,
    //                 segment.y,
    //                 20 * this.scale
    //             );
    //             headGradient.addColorStop(0, this.color); // Startfarbe
    //             headGradient.addColorStop(1, 'darkred'); // Endfarbe
    //
    //             ctx.fillStyle = headGradient;
    //
    //             // Kopf in Tropfenform
    //             ctx.beginPath();
    //             ctx.ellipse(
    //                 segment.x,
    //                 segment.y,
    //                 20 * this.scale, // Breite
    //                 30 * this.scale, // Höhe
    //                 Math.atan2(
    //                     this.targetY - segment.y,
    //                     this.targetX - segment.x
    //                 ), // Richtung
    //                 0,
    //                 2 * Math.PI
    //             );
    //             ctx.fill();
    //         } else {
    //             // Körpersegmente
    //             const bodyGradient = ctx.createRadialGradient(
    //                 segment.x,
    //                 segment.y,
    //                 0,
    //                 segment.x,
    //                 segment.y,
    //                 10 * this.scale
    //             );
    //             bodyGradient.addColorStop(0, this.color); // Startfarbe
    //             bodyGradient.addColorStop(1, 'black'); // Endfarbe
    //
    //             ctx.fillStyle = bodyGradient;
    //             ctx.beginPath();
    //             ctx.arc(segment.x, segment.y, 10 * this.scale, 0, 2 * Math.PI);
    //             ctx.fill();
    //         }
    //     });
    // }



}

}

// Export für CommonJS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Snake;
}

// Export für ES-Module
export default Snake;
