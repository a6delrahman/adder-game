// GameSessionPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from "../../context/WebSocketContext.jsx";
import GameTypeSelectionPage from './GameTypeSelectionPage';
import GameCanvas from './GameCanvas';

const GameSessionPage = () => {
    const { sessionId, playerSnake, sendMessage } = useWebSocket();
    const navigate = useNavigate();

    const joinSession = (gameType) => {
        sendMessage({ type: 'join_session', gameType });
    };

    React.useEffect(() => {
        if (sessionId) {
            navigate(`/session/${sessionId}`);
        }
    }, [sessionId, navigate]);

    return (
        <div>
            {sessionId ? (
                <GameCanvas sessionId={sessionId} snakeId={playerSnake?.snakeId} />
            ) : (
                <GameTypeSelectionPage onJoinSession={joinSession} />
            )}
        </div>
    );
};

export default GameSessionPage;
