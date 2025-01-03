class WebSocketManager {
  constructor() {
    if (!WebSocketManager.instance) {
      this.clients = new Map(); // clientId -> WebSocket
      this.sessions = new Map(); // sessionId -> Set<clientId>
      WebSocketManager.instance = this;
    }
    // return WebSocketManager.instance;
  }

  static getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  addClient(clientId, ws) {
    this.clients.set(clientId, ws);
  }

  sendGameStateToPlayers(gameState) {
    Object.values(gameState.players).forEach(player => {

      const ws = this.getWebSocketByClientId(player.clientId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        const message = this.createGameStateMessage(gameState, player);
        ws.send(JSON.stringify(message));
      }
    });
  }

  createGameStateMessage(gameState, player) {
    const nearbyPlayers = this.getNearbyPlayers(player, gameState.players);
    return {
      type: 'session_broadcast',
      players: nearbyPlayers.map(
          ({snakeId, headPosition, segments, currentEquation, score}) => ({
            snakeId,
            headPosition,
            segments,
            currentEquation,
            score,
          })),
      food: gameState.food,
    };
  }

  getWebSocketByClientId(clientId) {
    return this.clients.get(clientId);
  }

  getNearbyPlayers(currentPlayer, allPlayers) {
    const nearbyPlayers = [];

    Object.values(allPlayers).forEach((player) => {
      if (player.snakeId === currentPlayer.snakeId) {
        player.currentEquation = currentPlayer.currentEquation; // Übertrage die aktuelle Aufgabe
        nearbyPlayers.push(player.snake); // Füge den aktuellen Spieler hinzu
      } else {
        const dx = player.snake.headPosition.x
            - currentPlayer.snake.headPosition.x;
        const dy = player.snake.headPosition.y
            - currentPlayer.snake.headPosition.y;

        // Prüfe, ob der Spieler innerhalb des Bereichs liegt
        if (Math.sqrt(dx * dx + dy * dy) <= currentPlayer.fieldOfView) {
          nearbyPlayers.push(player.snake);
        }
      }
    });

    return nearbyPlayers;
  }

  sendMessageToPlayerByClientId(clientId, type, payload) {
    const message = {type, payload};
    const ws = this.getWebSocketByClientId(clientId);
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send message of type "${type}":`, error);
    }
  }

  addClientToSession(sessionId, clientId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Set());
    }
    this.sessions.get(sessionId).add(clientId);
  }

  broadcastToSession(sessionId, message) {
    const clientIds = this.sessions.get(sessionId) || new Set();
    clientIds.forEach((clientId) => {
      const ws = this.clients.get(clientId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  removeClient(clientId) {
    this.clients.delete(clientId);
  }

  removeClientFromAllSessions(clientId) {
    for (const session of this.sessions.values()) {
      session.delete(clientId);
    }
  }

  removeClientFromSession(sessionId, clientId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.delete(clientId);
      if (session.size === 0) {
        this.sessions.delete(sessionId);
      }
    }
  }

  isClientInSession(sessionId, clientId) {
    const session = this.sessions.get(sessionId);
    return session?.has(clientId);
  }

  isClientInAnySession(clientId) {
    return Array.from(this.sessions.values()).some(session => session.has(clientId));
  }

}

module.exports = WebSocketManager;
