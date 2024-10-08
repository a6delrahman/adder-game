// Beispiel für die Verwendung von WebSockets in einer React-Komponente
import React, { useState, useEffect } from 'react';

const GamePage = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        // WebSocket-Verbindung herstellen
        const ws = new WebSocket('ws://localhost:5000'); // Adresse des Servers

        // WebSocket-Verbindung öffnen
        ws.onopen = () => {
            console.log('WebSocket connection established');
            setSocket(ws);
        };

        // Nachrichten empfangen
        ws.onmessage = (event) => {
            const newMessage = event.data;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        // Fehler behandeln
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Verbindung schließen
        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Clean up beim Schließen der Komponente
        return () => {
            ws.close();
        };
    }, []);

    const sendMessage = () => {
        if (socket && input) {
            socket.send(input);
            setInput(''); // Eingabefeld leeren
        }
    };

    return (
        <div>
            <h1>Game Page with WebSocket</h1>
            <div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Send a message"
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <div>
                <h2>Messages:</h2>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
        </div>
    );
};

export default GamePage;
