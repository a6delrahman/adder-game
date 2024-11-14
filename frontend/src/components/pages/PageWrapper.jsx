import React, {useContext} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomePage from './HomePage';
import RegisterPage from './RegisterPage';
import LoginPage from "./LoginPage";
import DashboardPage from './DashboardPage';
import InstructionsPage from './InstructionsPage';
import ChooseSkillPage from './ChooseSkillPage';
import InGameSessionPage from './InGameSessionPage';
import GameOverPage from './GameOverPage';
import LeaderboardPage from './LeaderboardPage';
import ChatPage from './ChatPage';
import GameCanvas from "./GameCanvas";
import ProtectedRoute from '../ProtectedRoute.jsx';
import {AuthContext} from "../../context/AuthContext.jsx";
import ProfilePage from "./ProfilePage.jsx";

function PageWrapper() {
    const { isAuthenticated } = useContext(AuthContext);
    return (
        <div className="app-wrapper">
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/instructions" element={<InstructionsPage/>}/>
                    <Route path="/choose-skill" element={<ChooseSkillPage/>}/>
                    <Route path="/play" element={<InGameSessionPage/>}/>
                    <Route path="/playCanvas" element={<GameCanvas/>}/>
                    <Route path="/game-over" element={<GameOverPage/>}/>
                    <Route path="/leaderboard" element={<LeaderboardPage/>}/>
                    <Route path="/chat" element={<ChatPage/>}/>
                    <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProfilePage /></ProtectedRoute>} />
                </Routes>
        </div>
    );
}

export default PageWrapper;
