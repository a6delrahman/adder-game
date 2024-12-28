import React from "react";
import "./BackButton.css"
import {useNavigate} from "react-router-dom";

function Button(props) {
    const navigate = useNavigate();

    function handleClick(page) {
        navigate(page);
    }

    return (
        <div>
          {/*<Button text="Dashboard" style= "back-button" onClick={() => handleClick("/dashboard")} />*/}
            <button className="back-button" role="button" onClick={() => window.history.back()}>
                    Dashboard
            </button>
        </div>
    );
}

export default Button;