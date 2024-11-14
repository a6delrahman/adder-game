class Snake {
    constructor(initialX, initialY, options = {}) {
        this.position = { x: initialX, y: initialY };
        this.sections = [];
        this.scale = options.scale || 0.6;
        this.color = options.color || 'green';
    }

    updatePosition(segments) {
        this.sections = segments;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        this.sections.forEach(section => {
            ctx.beginPath();
            ctx.arc(section.x, section.y, 10 * this.scale, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

export default Snake;
