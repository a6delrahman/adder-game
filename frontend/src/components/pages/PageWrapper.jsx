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
import ProtectedRoute from '../ProtectedRoute.jsx';
import {AuthContext} from "../../context/AuthContext.jsx";
import ProfilePage from "./ProfilePage.jsx";
import GameSessionPage from "./GameSessionPage.jsx";
import GameTypeSelectionPage from "./GameTypeSelectionPage.jsx";
import GameCanvas from "./GameCanvas.jsx";
import logo from "../../assets/logo.png";
<img src={logo} alt="App Logo" />
import {WebSocketProvider} from "../../context/WebSocketContext.jsx";

function PageWrapper() {
    const {isAuthenticated} = useContext(AuthContext);


    return (
       
        <div className="app-wrapper">
        <img 
            src={logo} 
            alt="App Logo" 
            style={{ width: "300px", margin: "10px auto", display: "block" }}/>

            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/dashboard" element={<DashboardPage/>}/>
                <Route path="/instructions" element={<InstructionsPage/>}/>
                {/* Route für die Spielsession-Seite */}
                <Route path={"/GameCanvas"} element={
                    // <WebSocketProvider>
                        <GameCanvas/>
                    // </WebSocketProvider>
                }/>
                <Route path={"/gameTypeSelectionPage"} element={<GameTypeSelectionPage/>}/>
                <Route path="/session/:id" element={<GameSessionPage/>}/>
                <Route path="/gameSessionPage" element={
                    <WebSocketProvider>
                        <GameSessionPage/>
                    </WebSocketProvider>
                }/>
                <Route path="/game-over" element={<GameOverPage/>}/>
                <Route path="/leaderboard" element={<LeaderboardPage/>}/>
                <Route path="/profile"
                       element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProfilePage/></ProtectedRoute>}/>
            </Routes>
        </div>
    );
}

export default PageWrapper;
