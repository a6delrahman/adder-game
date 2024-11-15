import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import Button from "../utility/buttons/Button";
import { AuthContext } from '../../context/AuthContext.jsx';

const DashboardPage = () => {
    const { isAuthenticated } = useContext(AuthContext); // Zugriff auf den Authentifizierungsstatus

    const navigate = useNavigate();


    function handleClick(page) {
        navigate(page);
    }


    return (
        <div className="dashboard-page">
            <h1>Welcome to Adder Game</h1>
            <div className="dashboard-buttons">
                <Button text="Play" style="snake-button cobra" onClick={() => handleClick("/choose-skill")} />
                <Button text="Instructions" style="snake-button python" onClick={() => handleClick("/instructions")} />
                <Button text="Leaderboard" style="snake-button rattlesnake" onClick={() => handleClick("/leaderboard")} />
                {/* Nur anzeigen, wenn der Benutzer angemeldet ist */}
                {isAuthenticated && (
                    <Button text="Profile" style="snake-button rattlesnake" onClick={() => handleClick("/profile")} />
                )}
            </div>
        </div>

    );
};

export default DashboardPage;
