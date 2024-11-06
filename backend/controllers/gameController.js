// controllers/gameController.js
const PlayerAction = require('../models/PlayerAction');

exports.startGame = (req, res) => {
    res.json({ message: 'Game started!' });
};

exports.movePlayer = (req, res) => {
    const { playerId, direction } = req.body;
    const action = new PlayerAction({ playerId, action: direction });

    action.save()
        .then(() => {
            res.json({ message: `Player moved in direction ${direction}` });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not save player action' });
        });
};
