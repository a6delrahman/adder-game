// components/GameTypeSelectionPage.jsx
import React, {useState} from 'react';
import PropTypes from 'prop-types'; // Importiere PropTypes
import axios from "axios";

const GameTypeSelectionPage = ({ onSessionJoin }) => {
    const [gameType, setGameType] = useState('');


    const handleJoinSession = async (data) => {
        setGameType(data);
        // const userId = localStorage.getItem('userId'); // Angenommen, userId wird lokal gespeichert
        // if (!userId) {
        //     console.error('User ID is missing');
        //     return;
        // }
        try {
            const response = await axios.post('/api/session/join', { gameType, userId: '123' }); // userId als Beispielwert
            onSessionJoin(response.data.sessionId);
            console.log('Sending data to backend:', { gameType, userId });
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
