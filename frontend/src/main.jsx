import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from "./context/AuthContext.jsx";
// import reportWebVitals from "./reportWebVitals.js";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                {/*<Provider store={store}>*/}
                <App/>
                {/*</Provider>*/}
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);

// Optional: Performance-Messung
// reportWebVitals();
