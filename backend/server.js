// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const { handleConnection} = require('./controllers/webSocketController');
const {connectMongoDBWithRetry} = require("./utils/mongoDB/mongoDB");


// App-Instanz erstellen
const app = express();
const server = http.createServer(app);

// Middleware für JSON-Daten
app.use(express.json());
// Allow all cross-origin requests
app.use(cors());
// Statische Dateien aus dem Public-Verzeichnis bereitstellen
app.use(express.static('public'));



// API-Routen
// app.use('/api/game', gameRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', require('./routes/sessionRoutes'));

// Neue Route für die Admin-Seite
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html'); // Die HTML-Seite wird bereitgestellt
});
// Verbindung zur MongoDB
connectMongoDBWithRetry();
// WebSocket-Server erstellen und Verbindung verwalten
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => handleConnection(ws));

// Server starten
server.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on port ${process.env.PORT || 5000}`)
);