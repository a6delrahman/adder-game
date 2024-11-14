import React, { useState } from 'react';
import axios from "axios";

const LoginPage = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    // State for success/error message
    const [message, setMessage] = useState('');  // <-- This is the missing state

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send POST request to backend API
            const response = await axios.post('/api/users/login', credentials);

            console.log(response); // Log the response for debugging
            setMessage(response.data.msg); // Success message
        } catch (err) {
            console.log(err);

            if (err.response) {
                // Check if it's a backend error response
                setMessage(err.response.data.msg);  // Error message from the backend
            } else {
                // Handle any other errors (e.g., network issues)
                setMessage('Error login user');
            }
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
            {/* Display success or error message */}
            {message && <p>{message}</p>}
        </div>
    );
};

export default LoginPage;
