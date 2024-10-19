import React from 'react';

const InGameSessionPage = () => {
    return (
        <div className="in-game-session">
            <h1>20 + 20</h1>
            <div className="game-area">
                {/* Hier die Logik für das Schlangen-Spiel */}
                <div className="snake">S</div>
                <div className="game-grid">
                    {/* Zahlen und Spielbereich */}
                    <span>40</span>
                    <span>5</span>
                    <span>90</span>
                </div>
            </div>
        </div>
    );
};

export default InGameSessionPage;
