// components/GameTypeSelectionPage.jsx
import React, { useState } from 'react';
import axiosInstance from "../../axiosInstance.js";

const GameTypeSelectionPage = ({ onSessionJoin }) => {
    const [gameType, setGameType] = useState('');

    const handleJoinSession = async () => {
        try {
            const response = await axiosInstance.post('/api/session/join', { gameType });
            onSessionJoin(response.data.sessionId);
        } catch (err) {
            console.error('Failed to join session:', err);
        }
    };

    return (
        <div>
            <h2>Choose Game Type</h2>
            <select value={gameType} onChange={(e) => setGameType(e.target.value)}>
                <option value="addition">Addition</option>
                <option value="subtraction">Subtraction</option>
                <option value="multiplication">Multiplication</option>
            </select>
            <button onClick={handleJoinSession}>Join Game</button>
        </div>
    );
};

export default GameTypeSelectionPage;
