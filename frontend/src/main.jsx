// main.jsx

import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from "./context/AuthContext.jsx";
import {WebSocketProvider} from "./context/WebSocketContext.jsx";
// import reportWebVitals from "./reportWebVitals.js";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
            <WebSocketProvider>
                <AuthProvider>
                    {/*<Provider store={store}>*/}
                    <App/>
                    {/*</Provider>*/}
                </AuthProvider>
            </WebSocketProvider>
        </BrowserRouter>
    </StrictMode>
);

// Optional: Performance-Messung
// reportWebVitals();
