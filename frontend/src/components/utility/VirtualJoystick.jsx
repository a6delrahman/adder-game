import React, { useEffect, useRef } from 'react';
import nipplejs from 'nipplejs';

const VirtualJoystick = () => {
    const joystickRef = useRef(null);

    useEffect(() => {
        const joystick = nipplejs.create({
            zone: joystickRef.current,
            mode: 'static',
            position: { left: '50%', bottom: '50px' },
            color: 'blue',
        });

        joystick.on('move', (evt, data) => {
            console.log(data);
            // Handle joystick movement here
        });

        return () => {
            joystick.destroy();
        };
    }, []);

    return <div ref={joystickRef} style={{ width: '100%', height: '200px', position: 'fixed', bottom: 0, left: 0 }} />;
};

export default VirtualJoystick;