// src/axiosInstance.js
import axios from 'axios';
import { getAuthToken, setAuthToken } from './components/utility/auth/auth.js';

// Erstelle eine Axios-Instanz
const axiosInstance = axios.create({
    baseURL: 'https://adder-game-backend.onrender.com', // Basis-URL anpassen
});

// Interceptor hinzufügen, um den Token in den Header zu setzen
axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const { data } = await axios.post('https://adder-backend.azurewebsites.net/', { refreshToken });
                setAuthToken(data.accessToken);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token expired or invalid', refreshError);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
