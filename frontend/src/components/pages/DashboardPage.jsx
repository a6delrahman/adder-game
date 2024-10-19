import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    return (
        <div className="dashboard-page">
            <h1>Welcome to Adder Game</h1>
            <div className="dashboard-buttons">
                <Link to="/choose-skill">
                    <button className="snake-button cobra">Play</button>
                </Link>
                <Link to="/instructions">
                    <button className="snake-button python">Instructions</button>
                </Link>
                <Link to="/leaderboard">
                    <button className="snake-button rattlesnake">Leaderboard</button>
                </Link>
            </div>
            {/*<div className="game-container">*/}
            {/*    <h1>Welcome to Adder Game</h1>*/}
            {/*    <div className="menu-buttons">*/}
            {/*        <a href="/play" className="snake-button cobra">Play</a>*/}
            {/*        <a href="/instructions" className="snake-button python">Instructions</a>*/}
            {/*        <a href="/leaderboard" className="snake-button rattlesnake">Leaderboard</a>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>

    );
};

export default DashboardPage;
