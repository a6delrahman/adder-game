import React, { useState, useEffect } from 'react';

const BotSnake = ({ color, initialPosition }) => {
    const [botSnake, setBotSnake] = useState([initialPosition]);
    const [direction, setDirection] = useState({ x: 1, y: 0 });

    useEffect(() => {
        const intervalId = setInterval(() => {
            moveBot();
            if (Math.random() < 0.2) {
                // Wechselt die Richtung mit einer Wahrscheinlichkeit von 20%
                changeDirection();
            }
        }, 200);
        return () => clearInterval(intervalId);
    }, [botSnake, direction]);

    const changeDirection = () => {
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        const newDirection = directions[Math.floor(Math.random() * directions.length)];
        setDirection(newDirection);
    };

    const moveBot = () => {
        const newBotSnake = [...botSnake];
        const head = {
            x: newBotSnake[0].x + direction.x,
            y: newBotSnake[0].y + direction.y
        };
        newBotSnake.unshift(head);
        newBotSnake.pop();
        setBotSnake(newBotSnake);
    };

    return (
        <>
            {botSnake.map((segment, index) => (
                <div
                    key={index}
                    className="snake-segment"
                    style={{
                        backgroundColor: color,
                        left: `${segment.x * 20}px`,
                        top: `${segment.y * 20}px`
                    }}
                />
            ))}
        </>
    );
};

export default BotSnake;
