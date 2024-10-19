import logo from './logo.svg';
import './App.css';
import ChatPage from "./components/pages/ChatPage";
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import RegisterPage from './components/pages/RegisterPage';
import LoginPage from './components/pages/LoginPage';
import DashboardPage from './components/pages/DashboardPage';
import InstructionsPage from './components/pages/InstructionsPage';
import ChooseSkillPage from './components/pages/ChooseSkillPage';
import InGameSessionPage from './components/pages/InGameSessionPage';
import GameOverPage from './components/pages/GameOverPage';
import LeaderboardPage from './components/pages/LeaderboardPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/instructions" element={<InstructionsPage />} />
                <Route path="/choose-skill" element={<ChooseSkillPage />} />
                <Route path="/play" element={<InGameSessionPage />} />
                <Route path="/game-over" element={<GameOverPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Routes>
        </Router>
    );
}

export default App;
