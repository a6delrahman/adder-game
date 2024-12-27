// filepath: frontend/src/components/LeaderboardPage.jsx
import React, { useState } from 'react';
import { useScores } from '../../context/ScoreContext.jsx';

const LeaderboardPage = () => {
    const { scores, loading, error, fetchLeaderboard } = useScores();
    const [selectedGameType, setSelectedGameType] = useState('');
    const [username, setUsername] = useState('');

    const handleGameTypeChange = (event) => {
        const gameType = event.target.value;
        setSelectedGameType(gameType);
        fetchLeaderboard(gameType, username);
    };

    const handleUsernameChange = (event) => {
        const username = event.target.value;
        setUsername(username);
        fetchLeaderboard(selectedGameType, username);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (

        <div className="leaderboard-page">
            <h1>Leaderboard</h1>
            <div>
                <label htmlFor="gameType">Filter by Game Type: </label>
                <select id="gameType" value={selectedGameType} onChange={handleGameTypeChange}>
                    <option value="">All</option>
                    <option value="addition">Addition</option>
                    <option value="multiplication">Multiplication</option>
                    <option value="subtraction">Subtraction</option>
                </select>
            </div>
            <div>
                <label htmlFor="username">Filter by Username: </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Score</th>
                        <th>Game Type</th>
                        <th>Correct</th>
                        <th>Wrong</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((entry, index) => (
                        <tr key={entry._id}>
                            <td>{index + 1}</td>
                            <td>{entry.userId.username}</td>
                            <td>{entry.score}</td>
                            <td>{entry.gameType}</td>
                            <td>{entry.correctAnswers}</td>
                            <td>{entry.wrongAnswers}</td>
                            <td>{new Date(entry.playedAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
    );
};

export default LeaderboardPage;