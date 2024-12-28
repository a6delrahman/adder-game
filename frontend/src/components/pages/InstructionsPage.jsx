import React from 'react';

const InstructionsPage = () => {
    return (
        <div className="instructions-page">
            <h1>Instructions</h1>
            <p>
                The game <b>Adder</b> is a multiplayer snake game where the objective is to grow your snake as large as possible by collecting the correct solutions to various math problems, while avoiding collisions with other players.
            </p>

            <ol>
                <h2>How to play</h2>
                <li>
                    <b>Move Your Snake:</b> 
                    <ul>
                        <li><b>On desktop:</b> Use your mouse to control the direction.</li>
                        <li><b>On mobile:</b> Use the virtual joystick to guide your snake.</li>
                    </ul>
                </li>
                <li>
                    <b>Eat Math Results:</b> Consume the correct Math results as food scattered throughout the map to grow larger.
                </li>
                <li>
                    <b>Avoid Collisions:</b> Don't let your snake's head collide with another snake, or it will die.
                </li>
                <li>
                    <b>Boost Speed:</b> Use the left mouse button or double-tap the screen to move faster. Be strategic, as boosting costs some length.
                </li>
                <li>
                    <b>Survive and Dominate:</b> Stay alive, avoid larger snakes, and try to trap smaller ones to win.
                </li>
                <li>
                    <b>Climb the Leaderboard:</b> Grow the largest snake and aim to be at the top!
                </li>
            </ol>
        </div>
        
    );
};

export default InstructionsPage;
