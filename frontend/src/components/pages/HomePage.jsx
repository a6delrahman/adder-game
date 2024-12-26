import React from 'react';
import {useNavigate} from 'react-router-dom';
import Button from "../utility/buttons/Button";

const HomePage = () => {
    const navigate = useNavigate();
    function handleClick(page) {
        navigate(page);
    }

    return (
        <div className="homepage">
            <h1>Adder</h1>
            <div className="homepage-buttons">
                <Button text="Register" style= "snake-button cobra" onClick={() => handleClick("/register")} />
                <Button text="Login" style= "snake-button python" onClick={() => handleClick("/login")} />
            </div>
          <Button text="or just Play :)" style= "snake-button cobra" onClick={() => handleClick("/gameSessionPage")} />
        </div>
    );
};

export default HomePage;
