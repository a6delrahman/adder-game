class WebSocketManager {
  constructor() {
    this.webSocketIndex = new Map();
  }

  addClient(clientId, ws) {
    this.webSocketIndex.set(clientId, ws);
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
    return this.webSocketIndex.get(clientId);
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
}

module.exports = WebSocketManager;