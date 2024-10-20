import React from 'react';
import {Link} from 'react-router-dom';
import Button from "../utility/buttons/Button";

const HomePage = () => {
    return (
        <div className="homepage">
            <h1>Adder</h1>
            <div className="homepage-buttons">
                <Button text="Register" style= "snake-button cobra" nav="/register"/>
                <Button text="Login" style= "snake-button python" nav="/login"/>

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
