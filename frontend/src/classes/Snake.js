class Snake {
    constructor(initialX, initialY, options = {}) {
        this.position = { x: initialX, y: initialY };
        this.sections = [];
        this.segmentCount = options.segmentCount || 5;
        this.scale = options.scale || 0.6;
        this.color = options.color || 'green';
        this.speed = options.speed || 2;
    }

    updatePosition(segments) {
        this.sections = segments;
        // const newSections = Array.from({ length: this.segmentCount }, (_, i) => ({ x: this.position.x, y: this.position.y + i * this.speed }))
        // this.sections = newSections;
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
