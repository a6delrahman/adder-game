import React, { useState } from 'react';
import axios from 'axios'; // Ensure axios is installed

axios.defaults.baseURL = 'http://localhost:5000';  // Set the base URL for Axios requests

const RegisterPage = () => {
    // State for form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    // State for success/error message
    const [message, setMessage] = useState('');  // <-- This is the missing state

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send POST request to backend API
            const response = await axios.post('/api/users/register', formData);
    
            console.log(response); // Log the response for debugging
            setMessage(response.data.msg); // Success message
        } catch (err) {
            console.log(err); 
    
            if (err.response) {
                // Check if it's a backend error response
                setMessage(err.response.data.msg);  // Error message from the backend
            } else {
                // Handle any other errors (e.g., network issues)
                setMessage('Error registering user');
            }
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

            {/* Display success or error message */}
            {message && <p>{message}</p>}
        </div>
    );
};

export default RegisterPage;