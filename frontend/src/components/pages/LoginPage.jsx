import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../utility/auth/auth.js';
import { AuthContext} from "../../context/AuthContext.jsx";

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const { setIsAuthenticated } = useContext(AuthContext); // Verwende den AuthContext
    const navigate = useNavigate(); // Zum Weiterleiten nach Login

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send POST request to backend API
            const response = await axios.post('/api/auth/login', credentials);
            const token = response.data.token;

            // Token speichern und Auth-Status aktualisieren
            setAuthToken(token);
            setIsAuthenticated(true); // Setzt Authentifizierungsstatus auf true
            setMessage('Login erfolgreich');

            // Weiterleiten zum Dashboard
            navigate('/dashboard');
        } catch (err) {
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
                    placeholder="E-Mail"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
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
