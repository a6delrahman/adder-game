// GameTypeSelectionPage.jsx
import React, { useState } from 'react';
import { useWebSocket} from "../../context/WebSocketContext.jsx";
import {useNavigate} from "react-router-dom";

const GameTypeSelectionPage = () => {
    const { sendMessage } = useWebSocket();
    const navigate = useNavigate();


    const handleJoinSession = (selectedGameType) => {
        sendMessage({ type: 'join_session', gameType: selectedGameType });
        // navigate('/gameCanvas');

        // Öffne neuen Tab mit der GameCanvas-Seite
        window.open('/gameCanvas', '_blank'); // `_blank` öffnet einen neuen Tab
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

export default GameTypeSelectionPage;
