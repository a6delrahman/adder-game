const {v4: uuidv4} = require("uuid");

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.sessionActive = false;
  }

  isSessionActive = () => this.sessionActive;

  setActiveSessions = (value) => {
    this.sessionActive = value;
  };

  createSession(gameType) {
    const session = {
      id: uuidv4(),
      gameType,
      maxsize: 100,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  findSessionByGameType(gameType) {
    return Array.from(this.sessions.values()).find(session => session.gameType === gameType);
  }

  getSessionById(sessionId) {
    return this.sessions.get(sessionId);
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  removeSession(sessionId) {
    this.sessions.delete(sessionId);
  }

}

module.exports = SessionManager;