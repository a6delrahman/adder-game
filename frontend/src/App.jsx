// App.jsx
import './App.css';
import React from 'react';
// import Header from "./components/header/Header";
import PageWrapper from "./components/pages/PageWrapper";


function App() {
    return (
        <div className="App">
            {/* <div className='homepage-title'>
            <div class="glitch" data-text="ADDER">ADDER</div>
            <div class="glow">ADDER</div>
            <div class="scanlines"></div>
            </div> */}
            {/* <Header/> */}
            <PageWrapper/>

        </div>
    );
}

export default App;
