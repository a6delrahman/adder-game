// models/PlayerAction.js
const mongoose = require('mongoose');

const PlayerActionSchema = new mongoose.Schema({
    playerId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PlayerAction', PlayerActionSchema);
