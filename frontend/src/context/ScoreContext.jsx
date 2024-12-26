// filepath: frontend/src/context/ScoreContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export const ScoreContext = createContext();

export const ScoreProvider = ({ children }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboard = async (gameType) => {
        try {
            const response = await fetch(`/api/leaderboard/${gameType}`);
            console.log(response);
            if (!response.ok) throw new Error('Failed to fetch leaderboard');
            const data = await response.json();
            setScores(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard('addition');
    }, []);

    return (
        <ScoreContext.Provider value={{ scores, loading, error }}>
            {children}
        </ScoreContext.Provider>
    );
};

export const useScores = () => useContext(ScoreContext);