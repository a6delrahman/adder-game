// PageWrapper.jsx

import React, {useContext} from 'react';
import {Route, Routes} from 'react-router-dom';
import HomePage from './HomePage';
import RegisterPage from './RegisterPage';
import LoginPage from "./LoginPage";
import DashboardPage from './DashboardPage';
import InstructionsPage from './InstructionsPage';
import GameOverPage from './GameOverPage';
import LeaderboardPage from './LeaderboardPage';
import ChatPage from './ChatPage';
import ProtectedRoute from '../ProtectedRoute.jsx';
import {AuthContext} from "../../context/AuthContext.jsx";
import ProfilePage from "./ProfilePage.jsx";
import GameSessionPage from "./GameSessionPage.jsx";
import GameTypeSelectionPage from "./GameTypeSelectionPage.jsx";
import GameCanvas from "./GameCanvas.jsx";

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
                    {/* Route für die Spielsession-Seite */}
                    <Route path={"/GameCanvas"} element={<GameCanvas/>}/>
                    <Route path={"/gameTypeSelectionPage"} element={<GameTypeSelectionPage/>}/>
                    <Route path="/session/:id" element={<GameSessionPage />} />
                    <Route path="/gameSessionPage" element={<GameSessionPage />} />
                    <Route path="/game-over" element={<GameOverPage/>}/>
                    <Route path="/leaderboard" element={<LeaderboardPage/>}/>
                    <Route path="/chat" element={<ChatPage/>}/>
                    <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProfilePage /></ProtectedRoute>} />
                </Routes>
        </div>
    );
}

export default PageWrapper;
