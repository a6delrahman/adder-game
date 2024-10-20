import React from "react";
import "./Button.css"
import {useNavigate} from "react-router-dom";

function Button(props) {
    const navigate = useNavigate();

    function handleClick(page) {
        navigate(page);
    }

    return (
            <button className={props.style} onClick={() => handleClick(props.nav)}>
                <div className={props.icon}>{" " + props.text}</div>
            </button>
    );
}

export default Button;