import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Button from "../utility/buttons/Button";

const GameOverPage = () => {
    const navigate = useNavigate();

    function handleClick(page) {
        navigate(page);
    }
    return (
        <div className="game-over-page">
            <h1>Game Over</h1>
            <p>Current Score: 345</p>
            <Button text="Leaderboard" style="button-49" onClick={() => handleClick("/leaderboard")} />
            <Button text="New Game" style="button-49" onClick={() => handleClick("/play")} />
        </div>
    );
};

export default GameOverPage;
