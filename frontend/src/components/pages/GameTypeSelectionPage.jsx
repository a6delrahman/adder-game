// GameTypeSelectionPage.jsx
import React from 'react';
import { useWebSocket} from "../../context/WebSocketContext.jsx";
import Button from "../utility/buttons/Button.jsx";
import {useNavigate} from "react-router-dom";

const GameTypeSelectionPage = () => {
    const { sendMessage } = useWebSocket();
    const userId = localStorage.getItem('userId');

    const navigate = useNavigate();
    function handleClick(page) {
        navigate(page);
    }


    const handleJoinSession = (selectedGameType) => {
        sendMessage({ type: 'join_session', gameType: selectedGameType, fieldOfView: 800, userId: userId });
    };

    return (
        <div>
            <Button text="Dashboard" style="snake-button cobra" onClick={() => handleClick("/dashboard")} />

            <h1>Choose Game Type</h1>
            <div className="skill-buttons">
            <button className="skill-btn skill-add-btn" onClick={() => handleJoinSession('addition')}>
                    Addition
                </button>
                <button className="skill-btn skill-subtract-btn" onClick={() => handleJoinSession('subtraction')}>
                    Subtraction
                </button>
                <button className="skill-btn skill-multiply-btn" onClick={() => handleJoinSession('multiplication')}>
                    Multiplication
                </button>
            </div>
        </div>
    );
};

export default GameTypeSelectionPage;
