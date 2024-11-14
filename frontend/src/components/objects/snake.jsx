import React, {useState, useEffect} from 'react';
import './Snake.css';

const Snake = () => {
    const [snake, setSnake] = useState([{x: 10, y: 10}]); // Schlange mit einem Startsegment (Kopf)
    const [direction, setDirection] = useState({x: 1, y: 0}); // Startbewegung nach rechts
    const [queuedSections, setQueuedSections] = useState(0); // Anzahl zusätzlicher Segmente zur Verlängerung

    // Bewegung der Schlange
    useEffect(() => {
        const intervalId = setInterval(moveSnake, 100); // Schlange bewegt sich alle 100ms
        return () => clearInterval(intervalId);
    }, [snake, direction]);

    // Tastatursteuerung für Richtung
    useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    setDirection({x: 0, y: -1});
                    break;
                case 'ArrowDown':
                    setDirection({x: 0, y: 1});
                    break;
                case 'ArrowLeft':
                    setDirection({x: -1, y: 0});
                    break;
                case 'ArrowRight':
                    setDirection({x: 1, y: 0});
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Schlange bewegen
    const moveSnake = () => {
        const newSnake = [...snake];
        const head = {
            x: newSnake[0].x + direction.x,
            y: newSnake[0].y + direction.y
        };
        newSnake.unshift(head); // Neuer Kopf an die Spitze setzen

        if (queuedSections > 0) {
            setQueuedSections(queuedSections - 1); // Verlängern, wenn Segmente in der Warteschlange
        } else {
            newSnake.pop(); // Entferne das letzte Segment, wenn kein Wachstum
        }

        setSnake(newSnake);
    };

    // Funktion zum Hinzufügen von Segmenten
    const addSection = (amount = 1) => {
        setQueuedSections(queuedSections + amount);
    };

    return (
        <div>
            {snake.map((segment, index) => (
                <div
                    key={index}
                    className="snake-segment"
                    style={{
                        left: `${segment.x * 20}px`,
                        top: `${segment.y * 20}px`
                    }}
                >
                    🐍
                </div>
            ))}
            {/*<button onClick={() => addSection(5)}>Grow Snake</button> /!* Button zur Schlangeverlängerung *!/*/}
        </div>
    );
};

export default Snake;
