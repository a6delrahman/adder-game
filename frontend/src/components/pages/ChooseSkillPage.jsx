import React from 'react';
import {Link} from "react-router-dom";
import Button from "../utility/buttons/Button";

const ChooseSkillPage = () => {
    return (
        <div className="choose-skill-page">
            <h1>Choose Skill</h1>
            <div className="skill-buttons">
                <Button text="Addition" style="button-51"/>
                <Button text="Subtraction" style="button-52" />
                <Button text="Multiplication" style="button-53"/>
            </div>
            {/*<Link to="/play">*/}
            {/*    <button>Play</button>*/}
            {/*</Link>*/}
        </div>
    );
};

export default ChooseSkillPage;
