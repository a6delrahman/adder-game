// Snake.js
class Snake {
    constructor(initialX, initialY, options = {}) {
        this.position = { x: initialX, y: initialY };
        this.segments = [];
        this.segmentCount = options.segmentCount || 5;
        this.scale = options.scale || 0.6;
        this.color = options.color || 'green';
        this.speed = options.speed || 2;
        this.targetX = initialX;
        this.targetY = initialY;

        // Initialize segments
        for (let i = 0; i < this.segmentCount; i++) {
            this.segments.push({ x: initialX, y: initialY });
        }
        this.SNAKE_INITIAL_LENGTH = 20;
        this.queuedSegments = 0;

    }

    // updatePosition(segments) {
    //     this.segments = segments;
    //     // const newsegment = Array.from({ length: this.segmentCount }, (_, i) => ({ x: this.position.x, y: this.position.y + i * this.speed }))
    //     // this.segments = newsegment;
    // }

    updatePositionLocal(targetX, targetY) {
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

    updateDirection(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
    }

    movePlayer() {
        // First, the function calculates the difference between the target position and the current head position of the snake:
        const dx = this.targetX - this.position.x;
        const dy = this.targetY - this.position.y;

        // Next, it normalizes the direction vector to ensure the movement is consistent regardless of the distance to the target:
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        const directionX = magnitude > 0 ? dx / magnitude : 0;
        const directionY = magnitude > 0 ? dy / magnitude : 0;

        // // The speed of the snake is then determined, doubling if the boost is active:
        // const speed = playerState.boost ? SNAKE_SPEED * 2 : SNAKE_SPEED;

        // The head position of the snake is updated based on the direction and speed:
        this.position.x += directionX * this.speed;
        this.position.y += directionY * this.speed;

        // To ensure the snake stays within the game boundaries, the new head position is clamped:
        this.position.x = Math.max(0, Math.min(this.position.x, 800));
        this.position.y = Math.max(0, Math.min(this.position.y, 600));

        // A new segment is added to the front of the snake to represent the new head position:
        this.segments.unshift({...this.position});

        // Finally, if the number of segments exceeds the maximum allowed (initial length plus any queued segments), the oldest segment is removed:
        const maxSegments = this.SNAKE_INITIAL_LENGTH + this.queuedSegments;
        if (this.segments.length > maxSegments) {
            this.segments.pop();
        }
    }

    static visible(snake, camera) {
        const { x, y } = snake.position;
        const { width, height } = camera;
        return x >= 0 && x <= width && y >= 0 && y <= height;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        this.segments.forEach(segment => {
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, 10 * this.scale, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

export default Snake;
