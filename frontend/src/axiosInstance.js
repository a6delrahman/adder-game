// src/axiosInstance.js
import axios from 'axios';
import { getAuthToken } from './auth/auth.js'; // Diese Funktion holt den Token aus dem localStorage

// Erstelle eine Axios-Instanz
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000', // Basis-URL anpassen
});

// Interceptor hinzufügen, um den Token in den Header zu setzen
axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
