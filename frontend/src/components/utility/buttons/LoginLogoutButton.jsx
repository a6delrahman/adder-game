import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { handleLogout } from "../auth/auth.js";
// import './LoginLogoutButton.css';

const LoginLogoutButton = () => {
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleClick = async () => {
        if (isAuthenticated) {
            await handleLogout(); // Warte, bis die Abmeldung abgeschlossen ist
            setIsAuthenticated(false); // Aktualisiere den Auth-Zustand
        } else {
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
