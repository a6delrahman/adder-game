// controllers/webSocketController.js

const players = new Map(); // Map zum Speichern der Spielerpositionen

function handleConnection(ws, wss) {
    console.log('A new client connected');

    ws.on('message', (message) => {
        const messageString = message.toString('utf-8');
        try {
            const data = JSON.parse(messageString);
            if (data.type === 'update_position') {
                // Speichert die Spielerposition und weist der aktuellen WebSocket-Verbindung eine Position zu
                players.set(ws, data.position);

                // Broadcast die Position aller Spieler an alle Clients
                broadcastPlayerPositions(wss);
            }
        } catch (err) {
            console.log('Received non-JSON message:', messageString);
        }
    });

    ws.on('close', () => {
        players.delete(ws);
        broadcastPlayerPositions(wss); // Aktualisiere andere Clients nach Verlassen eines Spielers
        console.log('Client disconnected');
    });
}

function broadcastPlayerPositions(wss) {
    const allPlayerPositions = Array.from(players.values()).map((position, index) => ({
        id: index, // Optional: Eindeutige ID für jeden Spieler
        position
    }));
    const message = JSON.stringify({ type: 'update_position', players: allPlayerPositions });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

module.exports = { handleConnection };
