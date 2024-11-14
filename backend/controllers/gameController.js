const playerService = require('../services/playerService');

function handleMovement(data, ws) {
    playerService.updatePlayerDirection(data, ws);
}

module.exports = { handleMovement };
