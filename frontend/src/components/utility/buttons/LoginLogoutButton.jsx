import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
// import './LoginLogoutButton.css';

const LoginLogoutButton = () => {
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleClick = () => {
        if (isAuthenticated) {
            // Benutzer abmelden: Token aus localStorage entfernen und Authentifizierungsstatus zurücksetzen
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            navigate('/'); // Optional: zurück zur Startseite oder Dashboard
        } else {
            // Benutzer zur Login-Seite weiterleiten
            navigate('/login');
        }
    };

    return (
        <button onClick={handleClick} className="login-logout-button">
            {isAuthenticated ? 'Logout' : 'Login'}
        </button>
    );
};

export default LoginLogoutButton;
