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
app.use(cors());  // Allow all cross-origin requests

// Verbindung zur MongoDB: conn_string mit localhost oder MongoDB Docker standalone: mongodb://127.0.0.1:27017/Adder
// 
// conn_string mit docker-compose: 'mongodb://user:pass@mongodb:27017/Adder'

mongoose.connect('mongodb://127.0.0.1:27017/Adder', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// API-Routen
// app.use('/api/game', gameRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/session', sessionRoutes);

// WebSocket-Server erstellen und Verbindung verwalten
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => handleConnection(ws, wss));

setInterval(() => {
    // playerService.movePlayers();
    // websocketService.broadcastPlayerPositions(wss, playerService.getPlayers());
    // playerService.broadcastPlayerPositions();

    sessionService.movePlayers();
    sessionService.broadcastGameState();
}, 50);

// Server starten
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
