// server.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const { handleConnection} = require('./controllers/webSocketController');
const playerService = require('./services/playerService');
const websocketService = require('./services/webSocketService');
const sessionController = require('./controllers/sessionController');
const sessionService = require('./services/sessionService');

// App-Instanz erstellen
const app = express();
const server = http.createServer(app);

// Middleware für JSON-Daten
app.use(express.json());
// Allow all cross-origin requests
app.use(cors());
// Statische Dateien aus dem Public-Verzeichnis bereitstellen
app.use(express.static('public'));

// Verbindung zur MongoDB
mongoose.connect(process.env.CONN_STR, {})
    .then(() => console.log('MongoDB connected')).catch(err => console.log(err));

// API-Routen
// app.use('/api/game', gameRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/admin', require('./routes/sessionRoutes'));

// Neue Route für die Admin-Seite
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html'); // Die HTML-Seite wird bereitgestellt
});

// WebSocket-Server erstellen und Verbindung verwalten
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => handleConnection(ws));

setInterval(() => {
    if (sessionService.isSessionActive()) {
        sessionService.movePlayers();
        sessionService.broadcastGameState();
        // sessionService.broadcastGameStateWithDeltas();
    }
}, 50);

// Server starten
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
