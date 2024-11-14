function createSession(data, ws) {
    // Logik zur Erstellung einer neuen Sitzung
    // Hier könnte z.B. eine Lobby oder Spielinstanz erstellt werden
}

function joinSession(data, ws) {
    // Logik, um einem Spieler eine bestimmte Sitzung zuzuordnen
}

function removePlayerFromSession(ws) {
    // Optionale Logik, um einen Spieler beim Verlassen einer Sitzung zu entfernen
    // Dies könnte z.B. die Bereinigung der Sitzung beinhalten
}

module.exports = { createSession, joinSession, removePlayerFromSession };
