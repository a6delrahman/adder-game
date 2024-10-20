import React from "react";
import "./Button.css"
import {useNavigate} from "react-router-dom";

function Button(props) {
    const navigate = useNavigate();

    function handleClick(page) {
        navigate(page);
    }

    return (
            <a href="#" onClick={() => window.history.back()}>
                Back
            </a>
    );
}

export default Button;