// shared/classes/Snake.js
class Snake {
    constructor(snakeData) {
        if (typeof snakeData === 'object') {
            this.snakeId = snakeData.snakeId || '';
            this.headPosition = snakeData.headPosition || { x: 0, y: 0 };
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
                this.segments.push({ headPosition });
            }
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
        const { x, y } = snake.position;
        const { width, height } = camera;
        return x >= 0 && x <= width && y >= 0 && y <= height;
    }

    setBoost(boostActive) {
        console.log(`Setting boost for snake ${this.snakeId}: ${boostActive}`);
        this.boost = boostActive;
    }

    applyBoostPenalty(pointsToDrop) {
        if (this.boost) {
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




    draw(ctx) {
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const gradient = ctx.createRadialGradient(
                segment.x,
                segment.y,
                0,
                segment.x,
                segment.y,
                10 * this.scale
            );
            gradient.addColorStop(0, this.color); // Startfarbe (z. B. grün)
            gradient.addColorStop(1, 'black'); // Endfarbe (z. B. schwarz)

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, 10 * this.scale, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

}

// Export für CommonJS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Snake;
}

// Export für ES-Module
export default Snake;
