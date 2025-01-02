// GameSessionPage.jsx
import useWebSocket from "../hooks/useWebSocket.jsx";
import GameTypeSelectionPage from './GameTypeSelectionPage';
import GameCanvas from './GameCanvas';

const GameSessionPage = () => {
    const { isSessionActive} = useWebSocket();

    return (
        <div className='game-session-page'>
            {isSessionActive ? (
                <GameCanvas />
            ) : (
                <GameTypeSelectionPage />
            )}
        </div>
    );
};

export default GameSessionPage;
