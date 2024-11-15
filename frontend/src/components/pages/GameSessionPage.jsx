// GameSessionPage.jsx
import React, { useState } from 'react';
import GameTypeSelectionPage from './GameTypeSelectionPage';
import GameCanvas from './GameCanvas.jsx'; // Spielseite, die die Spielsession anzeigt
import { useNavigate } from 'react-router-dom';

const GameSessionPage = () => {
    const [sessionId, setSessionId] = useState(null);
    const navigate = useNavigate();

    // Funktion, die beim erfolgreichen Beitritt zu einer Sitzung ausgeführt wird
    const handleSessionJoin = (id) => {
        setSessionId(id); // Speichert die Sitzungs-ID
        navigate(`/session/${id}`); // Navigiert zur Session-Seite
    };

    return (
        <div>
            {sessionId ? (
                <GameCanvas sessionId={sessionId} /> // Spielseite anzeigen, wenn Sitzung beigetreten wurde
            ) : (
                <GameTypeSelectionPage onSessionJoin={handleSessionJoin} />
            )}
        </div>
    );
};

export default GameSessionPage;
