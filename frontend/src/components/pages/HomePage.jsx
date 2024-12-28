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
          

            <div className='homepage-wrapper'>

            <div className="homepage-buttons">
                <Button text="Register" style= "snake-button python" onClick={() => handleClick("/register")} />
                <Button text="Login" style= "snake-button python" onClick={() => handleClick("/login")} />
            </div>
            <div className='just-play'>
                <Button text="or just Play 🎮" style= "snake-button cobra" onClick={() => handleClick("/gameSessionPage")} />
            </div>
            </div>


        </div>
    );
};

export default HomePage;
