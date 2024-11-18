// // hooks/useGameSession.js
// import { useWebSocket } from '../../context/WebSocketContext.jsx';
//
// export const useGameSession = () => {
//     const { playerSnake, otherSnakes, isSessionActive, sendMessage } = useWebSocket();
//
//     const changeDirection = (snakeId, targetX, targetY, boost) => {
//         sendMessage({ type: 'change_direction', snakeId, targetX, targetY, boost });
//     };
//
//     return {
//         playerSnake,
//         otherSnakes,
//         isSessionActive,
//         changeDirection,
//     };
// };
