import React from 'react';
import {Link, useNavigate} from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    function handleClick(page) {
        navigate(page);
    }

    return (
        <div className="header">
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
                <Link to="/register">
                    <button>Register</button>
                </Link>
                <Link to="/login">
                    <button>Login</button>
                </Link>
                <Link to="/chat">
                    <button>Chat</button>
                </Link>
            </div>
        </div>
    );
};

export default Header;
