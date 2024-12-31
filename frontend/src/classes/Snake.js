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
            this.speed = snakeData.speed || 2;
            this.SNAKE_INITIAL_LENGTH = snakeData.SNAKE_INITIAL_LENGTH || 20;
            this.boost = snakeData.boost || false;
            this.currentEquation = snakeData.currentEquation || '';
            this.score = snakeData.score || 0;
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
            this.speed = options.speed || 2;
            this.SNAKE_INITIAL_LENGTH = 20;
            this.boost = false;
            this.currentEquation = {};
            this.score = 0;

            // // Initialize segments
            // for (let i = 0; i < this.segmentCount; i++) {
            //     this.segments.push({headPosition});
            // }
        }
        // this.isBrowser = typeof window !== 'undefined';
        // // Lade die Textur nur im Browser
        // if (this.isBrowser) {
        //     this.texture = new Image();
        //     this.texture.src = '/public/images/texture.png'; // Relativer Pfad zur Textur
        // }

    }

    calculateScale() {
        // Berechnung des Scales basierend auf der Punktzahl
        const baseScale = 3; // Basisgröße der Schlange
        const scaleFactor = 0.01; // Skalierungsfaktor
        return baseScale + this.segments.length * scaleFactor;
    }

    updateScore(score) {
        this.score = score;
        // this.scale = this.calculateScale(); // Aktualisiere den Scale, wenn der Score geändert wird
    }


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

    update(headPosition, segments) {
        this.headPosition = headPosition;
        this.segments = segments;
        this.scale = this.calculateScale();
    }

    updateEquation(equation) {
        this.currentEquation = equation
    }

    updateDirection(direction) {
        this.direction = direction;
    }


    moveSnake(boundaries) {
        // // Normiere die Richtung, falls sie nicht normalisiert ist
        // const magnitude = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
        // const normalizedDirectionX = magnitude > 0 ? this.direction.x / magnitude : 0;
        // const normalizedDirectionY = magnitude > 0 ? this.direction.y / magnitude : 0;


        // Berechne die Geschwindigkeit
        const speed = this.boost ? this.speed * 2 : this.speed;

        // Aktualisiere die Kopfposition basierend auf Richtung und Geschwindigkeit
        this.headPosition.x += this.direction.x * speed;
        this.headPosition.y += this.direction.y * speed;

        // Begrenze die Kopfposition innerhalb der Spielfeldgrenzen
        this.headPosition.x = Math.max(0, Math.min(this.headPosition.x, boundaries.width));
        this.headPosition.y = Math.max(0, Math.min(this.headPosition.y, boundaries.height));

        // Füge ein neues Segment für die neue Kopfposition hinzu
        this.segments.unshift({...this.headPosition});

        // Entferne ältere Segmente, wenn die maximale Länge überschritten wird
        const maxSegments = this.segmentCount;
        if (this.segments.length > maxSegments) {
            this.segments.pop();
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
        if (this === otherSnake) return false; // Stelle sicher, dass die Schlange nicht mit sich selbst verglichen wird

        const collisionRadius = 10; // Genauere Kollisionsdistanz definieren

        // Überprüfe Kollision zwischen dem Kopf der eigenen Schlange und den Segmenten der anderen
        return otherSnake.segments.some(segment =>
            Math.hypot(segment.x - this.headPosition.x, segment.y - this.headPosition.y) < collisionRadius
        );
    }


    checkCollisionWithFood(food) {
        return Math.hypot(this.headPosition.x - food.x, this.headPosition.y - food.y) < 10;
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
                console.error(`Ungültige Werte für Segment:`, {segment, scale: this.scale});
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

    //
    // // 4. Animation durch pulsierende Segmente
    // draw(ctx) {
    //     const timeFactor = Math.sin(Date.now() / 200); // Animationsfaktor
    //
    //     this.segments.forEach((segment, index) => {
    //         const scaleFactor = 1 + (timeFactor * (index / this.segments.length) * 0.1); // Leichtes Pulsieren
    //         ctx.fillStyle = this.color;
    //
    //         ctx.beginPath();
    //         ctx.arc(segment.x, segment.y, 10 * this.scale * scaleFactor, 0, 2 * Math.PI);
    //         ctx.fill();
    //     });
    //
    // }


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

// Export für ES-Module
export default Snake;



