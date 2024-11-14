import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../utility/auth/auth.js';
import { AuthContext} from "../../context/AuthContext.jsx";

const RegisterPage = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const { setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send POST request to backend API
            const response = await axios.post('/api/auth/register', formData);
            const token = response.data.token;

            // Token speichern und Auth-Status aktualisieren
            setAuthToken(token);
            setIsAuthenticated(true);

            console.log(response); // Log the response for debugging
            setMessage(response.data.msg); // Success message

            // Weiterleiten zum Dashboard
            navigate('/dashboard');
        } catch (err) {
            setMessage(err.response?.data.msg || 'Fehler bei der Registrierung');
        }
    };

    return (
        <div className="register-page">
            <h1>Register</h1>
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
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default RegisterPage;