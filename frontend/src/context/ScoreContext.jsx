// filepath: frontend/src/context/ScoreContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export const ScoreContext = createContext();

export const ScoreProvider = ({ children }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboard = async (gameType = '', username = '') => {
        try {
            const response = await fetch(`/api/leaderboard?gameType=${gameType}&username=${username}`);
            if (!response.ok) throw new Error('Failed to fetch leaderboard');
            const data = await response.json();
            if (data.error === 'User not found') {
                username = 'deleted user'
                throw new Error('User not found');
            }
            setScores(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    return (
        <ScoreContext.Provider value={{ scores, loading, error, fetchLeaderboard }}>
            {children}
        </ScoreContext.Provider>
    );
};

export const useScores = () => useContext(ScoreContext);