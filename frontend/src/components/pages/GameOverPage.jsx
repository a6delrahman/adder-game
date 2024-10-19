import React from 'react';
import { Link } from 'react-router-dom';

const GameOverPage = () => {
    return (
        <div className="game-over-page">
            <h1>Game Over</h1>
            <p>Current Score: 345</p>
            <Link to="/leaderboard">
                <button>Leaderboard</button>
            </Link>
            <Link to="/play">
                <button>New Game</button>
            </Link>
        </div>
    );
};

export default GameOverPage;
