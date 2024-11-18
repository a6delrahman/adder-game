// GameTypeSelectionPage.jsx
import React from 'react';
import { useWebSocket} from "../../context/WebSocketContext.jsx";

const GameTypeSelectionPage = () => {
    const { sendMessage } = useWebSocket();


    const handleJoinSession = (selectedGameType) => {
        sendMessage({ type: 'join_session', gameType: selectedGameType });
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
