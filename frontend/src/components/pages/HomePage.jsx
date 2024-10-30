import React from 'react';
import {Link} from 'react-router-dom';
import Button from "../utility/buttons/Button";

const HomePage = () => {
    return (
        <div className="homepage">
            <h1>Adder</h1>
            <div className="homepage-buttons">
                <Button text="Register" style= "snake-button cobra" nav="/register"/>
                <Button text="Login" style= "snake-button python" nav="/login"/>
            </div>
        </div>
    );
};

export default HomePage;
