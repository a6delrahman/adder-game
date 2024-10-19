import React from 'react';
import {Link} from "react-router-dom";

const ChooseSkillPage = () => {
    return (
        <div className="choose-skill-page">
            <h1>Choose Skill</h1>
            <div className="skill-buttons">
                <button>Addition</button>
                <button>Subtraction</button>
                <button>Algebra</button>
                <button>Fractions</button>
                <button>Multiplication</button>
                <button>Head</button>
            </div>
            <Link to="/play">
                <button>Play</button>
            </Link>
        </div>
    );
};

export default ChooseSkillPage;
