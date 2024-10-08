// controllers/gameController.js
exports.startGame = (req, res) => {
    // Beispiel: Logik zum Starten eines Spiels
    res.json({ message: 'Game started!' });
};

exports.movePlayer = (req, res) => {
    // Beispiel: Logik für Spielerbewegungen
    const { playerId, direction } = req.body;
    console.log(`Player ${playerId} moved in direction ${direction}`);
    res.json({ message: `Player moved in direction ${direction}` });
};
