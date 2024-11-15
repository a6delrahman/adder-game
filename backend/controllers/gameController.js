// controllers/gameController.js
const playerService = require('../services/playerService');
const sessionService = require('../services/sessionService');

exports.handleMovement = (data, ws) => {
    const { userId, targetX, targetY, boost } = data;
    const player = playerService.getPlayer(userId);

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
                    player: { id: userId, headPosition: player.headPosition, segments: player.segments }
                }));
            }
        });
    }
};
