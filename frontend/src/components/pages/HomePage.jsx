import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="homepage">
            <h1>Adder</h1>
            <div className="homepage-buttons">
                <Link to="/register">
                    <button>Register</button>
                </Link>
                <Link to="/login">
                    <button>Login</button>
                </Link>
            </div>
            <div className="pages-buttons">
                <Link to="/dashboard">
                    <button>dashboard</button>
                </Link>
                <Link to="/instructions">
                    <button>Instructions</button>
                </Link>
                <Link to="/choose-skill">
                    <button>Choose Skill</button>
                </Link>
                <Link to="/play">
                    <button>Play</button>
                </Link>
                <Link to="/game-over">
                    <button>Game Over</button>
                </Link>
                <Link to="/leaderboard">
                    <button>Leaderboard</button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
