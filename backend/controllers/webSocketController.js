// controllers/webSocketController.js

const players = new Map();
const SNAKE_SPEED = 1;

function handleConnection(ws, wss) {
    console.log('A new client connected');
    console.log('Total clients connected:', wss.clients.size);
    console.log('Total players:', players.size);

    const playerState = {
        position: { x: 5, y: 5 },
        direction: null,
        queuedSections: 0,
        id: players.size
    };
    players.set(ws, playerState);

    ws.on('message', (message) => {
        const messageString = message.toString('utf-8');
        try {
            const data = JSON.parse(messageString);

            if (data.type === 'change_direction') {
                playerState.direction = data.direction;
            }
        } catch (err) {
            console.log('Received non-JSON message:', messageString);
        }
    });

    ws.on('close', () => {
        players.delete(ws);
        broadcastPlayerPositions(wss);
        console.log('Client disconnected');
    });
}

function movePlayers() {
    players.forEach((playerState) => {
        if (playerState.direction) {
            const { position, direction } = playerState;
            switch (direction) {
                case 'up': position.y -= SNAKE_SPEED; break;
                case 'down': position.y += SNAKE_SPEED; break;
                case 'left': position.x -= SNAKE_SPEED; break;
                case 'right': position.x += SNAKE_SPEED; break;
                default: break;
            }
        }
    });
}

function broadcastPlayerPositions(wss) {
    const allPlayerPositions = Array.from(players.values()).map(({ position }, index) => ({
        id: index,
        position
    }));
    const message = JSON.stringify({ type: 'update_position', players: allPlayerPositions });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

module.exports = { handleConnection, movePlayers, broadcastPlayerPositions };
