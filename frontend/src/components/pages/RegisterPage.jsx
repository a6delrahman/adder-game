import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosInstance.js'; // Verwende die angepasste Axios-Instanz
import {
    setAuthToken,
    setRefreshToken,
    setUserId
} from '../utility/auth/auth.js'; // Importiere die Funktionen
import { AuthContext } from '../../context/AuthContext.jsx';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const { setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    // Funktion zur Eingabeverwaltung
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Funktion zur Registrierung
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send POST request to backend API
            const { data }  = await axiosInstance.post('/api/auth/register', formData);

            // Speichere Access-Token und Refresh-Token
            setAuthToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setUserId(data.user.id);

            // Setze Authentifizierungsstatus auf true
            setIsAuthenticated(true);
            setMessage('Registration erfolgreich');
            navigate('/');
        } catch (err) {
            console.error('Registration failed', err);
            setMessage(err.response?.data.msg || 'Fehler bei der Registrierung');
        }
    };

    return (
        <div className="register-page">
            <h1>Register</h1>
            <h3>Fill-up the form to register an account.</h3>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="E-Mail"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password (min 8 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="8"
                    required
                />
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default RegisterPage;