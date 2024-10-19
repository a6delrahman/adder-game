import React from 'react';

const LeaderboardPage = () => {
    const leaderboard = [
        { rank: 1, name: 'Player1', score: 500 },
        { rank: 2, name: 'Player2', score: 450 },
        { rank: 3, name: 'Player3', score: 400 }
    ];

    return (
        <div className="leaderboard-page">
            <h1>Leaderboard</h1>
            <table>
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score</th>
                </tr>
                </thead>
                <tbody>
                {leaderboard.map((entry) => (
                    <tr key={entry.rank}>
                        <td>{entry.rank}</td>
                        <td>{entry.name}</td>
                        <td>{entry.score}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={() => window.history.back()}>Back</button>
        </div>
    );
};

export default LeaderboardPage;
