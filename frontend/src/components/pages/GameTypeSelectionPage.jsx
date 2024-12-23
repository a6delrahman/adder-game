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
            <Button text="Dashboard" style= "snake-button cobra" onClick={() => handleClick("/dashboard")} />
        </div>
    );
};

export default GameTypeSelectionPage;
