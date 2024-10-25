// server.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const gameRoutes = require('./routes/gameRoutes'); // Beispielroute für das Spiel
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');

// App-Instanz erstellen
const app = express();
const server = http.createServer(app);

// Middleware für JSON-Daten
app.use(express.json());
app.use(cors());  // Allow all cross-origin requests

// Beispielhafte Verbindung zur MongoDB (du kannst deinen DB-String hier ersetzen)
mongoose.connect('mongodb://127.0.0.1:27017/Adder', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Beispielroute
app.use('/api/game', gameRoutes);
app.use('/api/users', userRoutes);


// WebSocket-Server erstellen
const wss = new WebSocket.Server({ server }); // WebSocket-Server an HTTP-Server binden

// Handling der WebSocket-Verbindungen
wss.on('connection', (ws) => {
    console.log('A new client connected');

    // Nachrichten von den Clients empfangen
    ws.on('message', (message) => {
        // Nachricht von Buffer in String umwandeln
        const messageString = message.toString('utf-8');
        console.log('received:', messageString);

        // Falls es sich um JSON-Daten handelt, kannst du sie hier auch parsen
        try {
            const data = JSON.parse(messageString);
            console.log('Parsed data:', data);
        } catch (err) {
            console.log('Received non-JSON message:', messageString);
        }

        // Beispiel: Broadcast der Nachricht an alle verbundenen Clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageString); // Originalnachricht an alle Clients senden
            }
        });
    });

    // Verbindung wird geschlossen
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Server starten
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));