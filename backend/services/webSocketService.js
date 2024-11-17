function broadcastPlayerPositions(wss, players) {
    const allPlayerData = Array.from(players.values()).map(({ headPosition, segments, snakeId }) => ({
        snakeId,
        headPosition,
        segments,
    }));
    const message = JSON.stringify({ type: 'update_position', players: allPlayerData });
    broadcastMessage(wss, message);
}

function broadcastMessage(wss, message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}



module.exports = { broadcastPlayerPositions, broadcastMessage };
