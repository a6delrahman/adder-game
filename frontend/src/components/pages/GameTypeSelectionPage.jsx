// GameTypeSelectionPage.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const GameTypeSelectionPage = ({ onJoinSession }) => {
    const [gameType, setGameType] = useState('addition');

    const handleJoinSession = (selectedGameType) => {
        setGameType(selectedGameType);
        onJoinSession(selectedGameType); // Sende Anfrage über die zentrale Funktion
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

GameTypeSelectionPage.propTypes = {
    onJoinSession: PropTypes.func.isRequired,
};

export default GameTypeSelectionPage;
