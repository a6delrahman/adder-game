// models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    gameType: { type: String, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxPlayers: { type: Number, default: 10 },
});

module.exports = mongoose.model('Session', sessionSchema);
