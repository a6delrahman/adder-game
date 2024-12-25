// App.jsx
import './App.css';
import React from 'react';
import Header from "./components/header/Header";
import PageWrapper from "./components/pages/PageWrapper";
import BackButton from "./components/utility/buttons/BackButton";

function App() {
    return (
        <div className="App">
            <Header/>
            <PageWrapper/>
        </div>
    );
}

export default App;
