// src/context/AuthContext.js
import {createContext, useState, useEffect, useMemo} from 'react';
import { getAuthToken } from '../components/utility/auth/auth.js';
import PropTypes from "prop-types";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = getAuthToken();
        setIsAuthenticated(!!token);
    }, []);

    const value = useMemo(() => ({
        isAuthenticated,
        setIsAuthenticated,
    }), [isAuthenticated]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};