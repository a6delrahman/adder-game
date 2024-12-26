class WebSocketManager {
  constructor() {
    this.webSocketIndex = new Map();
  }

  addPlayer(clientId, ws) {
    this.webSocketIndex.set(clientId, ws);
  }

  sendGameStateToPlayers(gameState) {
    Object.values(gameState.players).forEach(player => {
      const ws = this.getWebSocketByPlayer(player.snakeId);
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
      players: nearbyPlayers.map(({ snakeId, headPosition, segments, score }) => ({
        snakeId,
        headPosition,
        segments,
        score,
      })),
      food: gameState.food,
    };
  }

  getWebSocketByPlayer(snakeId) {
    for (const [ws, playerInfo] of this.playerIndex.entries()) {
      if (playerInfo.snakeId === snakeId) {
        return ws;
      }
    }
    return null;
  }

  getNearbyPlayers(currentPlayer, allPlayers) {
    return Object.values(allPlayers).filter(otherPlayer => {
      if (otherPlayer.snakeId === currentPlayer.snakeId) return true;
      const dx = otherPlayer.snake.headPosition.x - currentPlayer.snake.headPosition.x;
      const dy = otherPlayer.snake.headPosition.y - currentPlayer.snake.headPosition.y;
      return Math.sqrt(dx * dx + dy * dy) <= currentPlayer.fieldOfView;
    });
  }
}

module.exports = WebSocketManager;
