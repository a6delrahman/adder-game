import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {BrowserRouter} from 'react-router-dom';
// import reportWebVitals from "./reportWebVitals.js";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            {/*<Provider store={store}>*/}
            <App/>
            {/*</Provider>*/}
        </BrowserRouter>
    </StrictMode>
);

// Optional: Performance-Messung
// reportWebVitals();
