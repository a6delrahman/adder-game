// GameSessionPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from "../../context/WebSocketContext.jsx";
import GameTypeSelectionPage from './GameTypeSelectionPage';
import GameCanvas from './GameCanvas';

const GameSessionPage = () => {
    const { isSessionActive, playerSnake, sendMessage } = useWebSocket();

    return (
        <div>
            {isSessionActive ? (
                <GameCanvas />
            ) : (
                <GameTypeSelectionPage />
            )}
        </div>
    );
};

export default GameSessionPage;
