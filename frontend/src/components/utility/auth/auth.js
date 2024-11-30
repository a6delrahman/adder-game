// src/components/utility/auth/auth.js

import axiosInstance from "../../../axiosInstance.js";
// todo 1: save bearer token in session storage
// Speichert das Access-Token
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

// Ruft das Access-Token ab
export const getAuthToken = () => localStorage.getItem('token');

// Speichert das Refresh-Token
export const setRefreshToken = (refreshToken) => {
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    } else {
        localStorage.removeItem('refreshToken');
    }
};

// Ruft das Refresh-Token ab
export const getRefreshToken = () => localStorage.getItem('refreshToken');

// Logout-Funktion
export const handleLogout = async () => {
    try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            await axiosInstance.post('/api/auth/logout', { refreshToken });
        }
        setAuthToken(null);
        setRefreshToken(null);
    } catch (err) {
        console.error('Logout failed', err);
    }
};