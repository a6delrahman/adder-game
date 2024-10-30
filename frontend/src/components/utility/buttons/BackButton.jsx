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
            <button className="back-button" role="button" onClick={() => window.history.back()}>
                    Back
            </button>
        </div>
    );
}

export default Button;