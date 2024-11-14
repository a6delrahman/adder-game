// function createSession(data, ws) {
//     // Logik zur Erstellung einer neuen Sitzung
//     // Hier könnte z.B. eine Lobby oder Spielinstanz erstellt werden
// }

const Session = require('../models/Session');

async function createSession (req, res) {
    const { gameType, userId } = req.body;
    const session = new Session({ gameType, players: [userId] });
    await session.save();
    res.json({ sessionId: session._id });
}

// function joinSession(data, ws) {
//     // Logik, um einem Spieler eine bestimmte Sitzung zuzuordnen
// }

async function joinSession(req, res) {
    const { sessionId, userId } = req.body;
    const session = await Session.findById(sessionId);
    if (session && session.players.length < session.maxPlayers) {
        session.players.push(userId);
        await session.save();
        res.json({ msg: 'Joined session' });
    } else {
        res.status(400).json({ msg: 'Session full or not found' });
    }
}

function removePlayerFromSession(ws) {
    // Optionale Logik, um einen Spieler beim Verlassen einer Sitzung zu entfernen
    // Dies könnte z.B. die Bereinigung der Sitzung beinhalten
}

module.exports = { createSession, joinSession, removePlayerFromSession };
