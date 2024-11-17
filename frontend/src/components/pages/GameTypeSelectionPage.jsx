// components/GameTypeSelectionPage.jsx
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types'; // Importiere PropTypes
import axios from "axios";
import Snake from "../../classes/Snake.js";

const GameTypeSelectionPage = ({ ws, onSessionJoin }) => {
    const [gameType, setGameType] = useState('addition');
    const wsRef = useRef(ws); // Referenz für WebSocket, damit es session-spezifisch ist

    useEffect(() => {
        wsRef.current = ws;
    }, [ws]);

    const handleJoinSession = async (selectedGameType) => {
        const userId = localStorage.getItem('userId');
        // if (!userId) {
        //     console.error('User ID is missing');
        //     return;
        // }

        try {
            setGameType(selectedGameType);
            wsRef.current.send(JSON.stringify({ type: 'join_session', gameType: selectedGameType, userId }));
            // onSessionJoin(response.data.sessionId);
            console.log('Sending data to backend:', { gameType: selectedGameType, userId });
        } catch (err) {
            console.error('Failed to join session:', err);
        }
    };

    return (
        <div>
            <h1>Choose Game Type</h1>
            <div className="skill-buttons">
                <button className="button-51" onClick={() => handleJoinSession('addition')}>
                    Addition
                </button>
                <button className="button-52" onClick={() => handleJoinSession('subtraction')}>
                    Subtraction
                </button>
                <button className="button-53" onClick={() => handleJoinSession('multiplication')}>
                    Multiplication
                </button>
            </div>
        </div>
    );
};

// Füge Prop-Validierung hinzu
GameTypeSelectionPage.propTypes = {
    onSessionJoin: PropTypes.func.isRequired, // Erwarte eine Funktion als Prop
};

export default GameTypeSelectionPage;
