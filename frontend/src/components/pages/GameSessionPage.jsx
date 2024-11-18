// GameSessionPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from "../../context/WebSocketContext.jsx";
import GameTypeSelectionPage from './GameTypeSelectionPage';
import GameCanvas from './GameCanvas';

const GameSessionPage = () => {
    const { isSessionActive, playerSnake, sendMessage } = useWebSocket();
    const navigate = useNavigate();

    // const joinSession = (gameType) => {
    //     sendMessage({ type: 'join_session', gameType });
    // };

    // React.useEffect(() => {
    //     if (isSessionActive) {
    //         navigate(`/session/${sessionId}`);
    //     }
    // }, [sessionId, navigate]);

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
