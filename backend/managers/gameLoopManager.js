class GameLoopManager {
  constructor(interval) {
    this.interval = interval; // Intervall in Millisekunden
    this.timers = new Map(); // Speicher für Timer-Funktionen
  }

  addLoop(name, callback) {
    if (this.timers.has(name)) {
      console.error(`Loop with name '${name}' already exists.`);
      return;
    }
    const timerId = setInterval(callback, this.interval);
    this.timers.set(name, timerId);
  }

  removeLoop(name) {
    if (!this.timers.has(name)) {
      console.error(`Loop with name '${name}' does not exist.`);
      return;
    }
    clearInterval(this.timers.get(name));
    this.timers.delete(name);
    console.log(`Loop with name '${name}' removed.`);
  }

  clearAllLoops() {
    this.timers.forEach((timerId) => clearInterval(timerId));
    this.timers.clear();
  }
}

module.exports = GameLoopManager;
