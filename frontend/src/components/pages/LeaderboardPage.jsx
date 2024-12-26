// filepath: frontend/src/components/LeaderboardPage.jsx
import React from 'react';
import { useScores } from '../../context/ScoreContext.jsx';

const LeaderboardPage = () => {
    const { scores, loading, error } = useScores();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (

        <div className="leaderboard-page">
            <h1>Leaderboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Score</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((entry, index) => (
                        <tr key={entry._id}>
                            <td>{index + 1}</td>
                            <td>{entry.userId.username}</td>
                            <td>{entry.score}</td>
                            <td>{new Date(entry.playedAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
    );
};

export default LeaderboardPage;