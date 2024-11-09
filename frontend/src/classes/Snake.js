class Snake {
    constructor(initialX, initialY, options = {}) {
        // Schlange initialisieren
        this.position = { x: initialX, y: initialY };
        this.sections = [];
        this.headPath = [];
        this.snakeLength = 30; // Standardlänge beim Start

        // Konfigurierbare Eigenschaften
        this.scale = options.scale || 0.6;
        this.speed = options.speed || 2;
        this.preferredDistance = 17 * this.scale;
        this.queuedSections = 0;
        this.rotationSpeed = options.rotationSpeed || 2;
        this.color = options.color || 'green';

        // Kopf und Abschnitt hinzufügen
        this.initSections(this.snakeLength);
    }

    /**
     * Gibt der Schlange beim Start die initialen Abschnitte
     * @param {Number} num Anzahl der Abschnitte
     */
    initSections(num) {
        for (let i = 0; i < num; i++) {
            const x = this.position.x;
            const y = this.position.y + i * this.preferredDistance;
            this.addSectionAtPosition(x, y);
            this.headPath.push({ x, y });
        }
    }

    /**
     * Fügt einen Abschnitt an einer gegebenen Position hinzu
     * @param {Number} x X-Koordinate
     * @param {Number} y Y-Koordinate
     */
    addSectionAtPosition(x, y) {
        const section = { x, y };
        this.sections.push(section);
        return section;
    }

    /**
     * Aktualisiert die Position der Schlange basierend auf dem aktuellen Pfad
     */
    update() {
        const { x, y } = this.position;

        // Kopf bewegt sich in die aktuelle Richtung
        this.position.x += Math.cos(this.rotationSpeed) * this.speed;
        this.position.y += Math.sin(this.rotationSpeed) * this.speed;

        // Pfad für Kopfbewegung aktualisieren
        const newHeadPosition = { x: this.position.x, y: this.position.y };
        this.headPath.unshift(newHeadPosition);
        if (this.headPath.length > this.snakeLength) {
            this.headPath.pop();
        }

        // Sektionen folgen dem Kopfpfad
        for (let i = 0; i < this.sections.length; i++) {
            const targetPos = this.headPath[i];
            if (targetPos) {
                this.sections[i].x = targetPos.x;
                this.sections[i].y = targetPos.y;
            }
        }
    }

    /**
     * Zeichnet die Schlange auf dem Canvas
     * @param {CanvasRenderingContext2D} ctx Canvas-Rendering-Kontext
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        this.sections.forEach(section => {
            ctx.beginPath();
            ctx.arc(section.x, section.y, 10 * this.scale, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    /**
     * Fügt zusätzliche Abschnitte zur Warteschlange hinzu
     * @param {Number} amount Anzahl der zusätzlichen Abschnitte
     */
    addSectionsAfterLast(amount) {
        this.queuedSections += amount;
    }

    /**
     * Vergrößert die Schlange und fügt Abschnitte hinzu
     */
    incrementSize() {
        this.addSectionsAfterLast(1);
        this.snakeLength++;
    }

    /**
     * Bewegt die Schlange in eine bestimmte Richtung
     * @param {String} direction Richtung (z.B. 'up', 'down', 'left', 'right')
     */
    changeDirection(direction) {
        switch (direction) {
            case 'up':
                this.rotationSpeed = -Math.PI / 2;
                break;
            case 'down':
                this.rotationSpeed = Math.PI / 2;
                break;
            case 'left':
                this.rotationSpeed = Math.PI;
                break;
            case 'right':
                this.rotationSpeed = 0;
                break;
        }
    }
}
export default Snake;