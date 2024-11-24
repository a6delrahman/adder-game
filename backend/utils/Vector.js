class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Methode zur Normalisierung des Vektors
    normalize() {
        const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
        if (magnitude > 0) {
            this.x /= magnitude;
            this.y /= magnitude;
        }
    }
}

export default Vector;