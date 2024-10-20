import React from 'react';
import { Link } from 'react-router-dom';
import Button from "../utility/buttons/Button";
import BackButton from "../utility/buttons/BackButton";
const DashboardPage = () => {
    return (
        <div className="dashboard-page">
            <h1>Welcome to Adder Game</h1>
            <div className="dashboard-buttons">
                <Button text="Play" style="snake-button cobra" nav="/choose-skill" />
                <Button text="Instructions" style="snake-button python" nav="/instructions" />
                <Button text="Leaderboard" style="snake-button rattlesnake" nav="/leaderboard" />
                <BackButton/>
            </div>
        </div>

    );
};

export default DashboardPage;
