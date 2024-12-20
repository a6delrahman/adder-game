// LoginPage.jsx

import React, { useState, useContext } from 'react';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { setAuthToken, setRefreshToken, setUserId } from '../utility/auth/auth.js'; // Importiere Funktionen
import { AuthContext } from "../../context/AuthContext.jsx";

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const { setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send POST request to backend API
            const { data } = await axiosInstance.post('/api/auth/login', credentials);

            // Token und Refresh-Token speichern
            setAuthToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setUserId(data.user.id);

            // Setzt Authentifizierungsstatus auf true
            setIsAuthenticated(true);
            setMessage('Login erfolgreich');

            // // Weiterleiten zum Dashboard
            navigate('/');
        } catch (err) {
            console.error('Login failed', err);
            setMessage(err.response?.data.msg || 'Fehler bei der Anmeldung');
        }
    };

    return (
        <div className="login-page">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    autoComplete={'on'}
                    placeholder="E-Mail"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    autoComplete={'on'}
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default LoginPage;
