// function changeDirection(data, ws) {
//     const playerState = players.get(ws);
//     if (playerState) {
//         playerState.targetPosition = { x: data.targetX, y: data.targetY };
//         playerState.boost = data.boost || false;
//     }
// }
//
// //Todo: Testing this function
// function movePlayers() {
//     players.forEach((playerState) => {
//         const dx = playerState.targetPosition.x - playerState.headPosition.x;
//         const dy = playerState.targetPosition.y - playerState.headPosition.y;
//         const distance = Math.sqrt(dx * dx + dy * dy);
//         // Geschwindigkeit je nach Boost-Flag setzen
//         const speed = playerState.boost ? SNAKE_SPEED * 2 : SNAKE_SPEED;
//
//         if (distance > 0) {
//             playerState.headPosition.x += (dx / distance) * speed;
//             playerState.headPosition.y += (dy / distance) * speed;
//             playerState.segments.unshift({ ...playerState.headPosition });
//             if (playerState.segments.length > playerState.maxSegments) playerState.segments.pop();
//         }
//     });
// }
//
// module.exports = { changeDirection, movePlayers };