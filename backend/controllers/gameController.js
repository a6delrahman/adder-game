// controllers/gameController.js
const playerService = require('../services/playerService');
const sessionService = require('../services/sessionService');

exports.handleMovement = (data, ws) => {
    const { snakeId, targetX, targetY, boost } = data;
    const player = playerService.getPlayerBySnakeId(snakeId);

    if (!player) return;

    player.targetPosition = { x: targetX, y: targetY };
    player.boost = boost;

    const session = sessionService.getSession(player.sessionId);
    if (session) {
        session.players.forEach((sessionUserId) => {
            const userSocket = playerService.getSocketByUserId(sessionUserId);
            if (userSocket && userSocket !== ws) {
                userSocket.send(JSON.stringify({
                    type: 'update_position',
                    player: { id: snakeId, headPosition: player.headPosition, segments: player.segments }
                }));
            }
        });
    }
};

// function handleMovement(data, ws) {
//     const session = sessionService.getSessionByPlayerSocket(ws);
//     if (session) {
//         const player = session.players.find(player => player.ws === ws);
//         if (player) {
//             player.targetPosition = { x: data.targetX, y: data.targetY };
//             player.boost = data.boost || false;
//         } else {
//             console.error('Player not found in the session');
//         }
//     } else {
//         console.error('Session not found for the given WebSocket');
//     }
// }