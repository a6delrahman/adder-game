class Snake {
    constructor(initialX, initialY, options = {}) {
        this.headPosition = { x: initialX, y: initialY };
        this.segments = []; // Liste der Segmente
        // this.segmentCount = options.segmentCount || 5;
        this.scale = options.scale || 0.6;
        this.color = options.color || 'green';
        this.speed = options.speed || 2;
    }

    updatePosition(segments) {
        this.segments = segments;
    }

    // updatePosition(headPosition, segmentCount) {
    //     // if (segments){
    //     //     this.segments = segments;
    //     //     this.segmentCount = segments.length;
    //     //     return
    //     // }
    //
    //     if (!this.headPosition) {
    //         // Falls keine vorherige Position vorhanden ist, initialisieren
    //         this.headPosition = headPosition;
    //     }
    //
    //     // Bewegung des Kopfes berechnen
    //     const dx = headPosition.x - this.headPosition.x;
    //     const dy = headPosition.y - this.headPosition.y;
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //
    //     // Richtung normalisieren (für gleichmäßige Schritte)
    //     const directionX = distance > 0 ? dx / distance : 0;
    //     const directionY = distance > 0 ? dy / distance : 0;
    //
    //     // Kopfposition aktualisieren
    //     this.headPosition = headPosition;
    //
    //     // Segmente rekonstruieren
    //     const newSegments = [{ ...this.headPosition }]; // Start mit dem Kopf
    //     for (let i = 1; i < segmentCount; i++) {
    //         const previousSegment = newSegments[i - 1];
    //
    //         // Jedes Segment folgt dem vorherigen
    //         newSegments.push({
    //             x: previousSegment.x - directionX * this.speed,
    //             y: previousSegment.y - directionY * this.speed,
    //         });
    //     }
    //
    //     this.segments = newSegments;
    // }


    // Zeichne die Schlange
    draw(ctx) {
        ctx.fillStyle = this.color;
        this.segments.forEach((segment) => {
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, 10 * this.scale, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

export default Snake;
