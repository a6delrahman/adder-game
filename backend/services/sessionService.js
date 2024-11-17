// services/sessionService.js
const {v4: uuidv4} = require('uuid');

const sessions = new Map();
const SNAKE_SPEED = 2;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const SNAKE_INITIAL_LENGTH = 50;


function createOrFindSession(gameType, ws, userId = null) {
    let session = Array.from(sessions.values()).find(
        (sess) => sess.gameType === gameType && sess.players.length < sess.maxPlayers
    );

    if (!session) {
        session = {
            id: uuidv4(),
            gameType,
            players: [],
            maxPlayers: 4
        };
        sessions.set(session.id, session);
    }

    if (!session.players.some(player => player.ws === ws)) {
        const snakeId = uuidv4();
        const playerState = {
            snakeId,
            sessionId: session.id,
            userId,
            ws,
            headPosition: { x: 100, y: 100 },
            targetPosition: { x: 100, y: 100 },
            boost: false,
            segments: Array.from({ length: 50 }, (_, i) => ({ x: 100, y: 100 + i * 10 })),
            queuedSegments: 0,
        };
        session.players.push(playerState);
        ws.send(JSON.stringify({type: 'session_joined', playerState}));
        // ws.send(JSON.stringify({ type: 'snake_id', snakeId }));
    }
}

function getPlayersInSession(sessionId) {
    const session = sessions.get(sessionId);
    return session ? session.players : [];
}

function getSession(sessionId) {
    return sessions.get(sessionId);
}

function getAllSessions() {
    return sessions;
}

function removePlayerFromSession(sessionId, userId) {
    const session = sessions.get(sessionId);
    if (session) {
        session.players = session.players.filter((id) => id !== userId);
        if (session.players.length === 0) {
            sessions.delete(sessionId); // Löscht leere Sessions
        }
    }
}

function broadcastGameState() {
    sessions.forEach(session => {
        const allPlayerData = session.players.map(({ headPosition, segments, snakeId }) => ({
            snakeId,
            headPosition,
            segments,
        }));

        const message = JSON.stringify({ type: 'session_broadcast', players: allPlayerData });

        session.players.forEach(player => {
            if (player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(message);
            }
        });
    });
}

function handleMovement(data, ws) {
    const session = getSessionByPlayerSocket(ws);
    if (session) {
        const player = session.players.find(player => player.ws === ws);
        if (player) {
            player.targetPosition = { x: data.targetX, y: data.targetY };
            player.boost = data.boost || false;
        } else {
            console.error('Player not found in the session');
        }
    } else {
        console.error('Session not found for the given WebSocket');
    }
}

function getSessionByPlayerSocket(ws) {
    return Array.from(sessions.values()).find(session => session.players.some(player => player.ws === ws));
}

function movePlayers() {
    sessions.forEach(session => {
        session.players.forEach(playerState => {
            const dx = playerState.targetPosition.x - playerState.headPosition.x;
            const dy = playerState.targetPosition.y - playerState.headPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const speed = playerState.boost ? SNAKE_SPEED * 2 : SNAKE_SPEED;

            if (distance > 0) {
                playerState.headPosition.x += (dx / distance) * speed;
                playerState.headPosition.y += (dy / distance) * speed;
                playerState.headPosition.x = Math.max(0, Math.min(playerState.headPosition.x, FIELD_WIDTH));
                playerState.headPosition.y = Math.max(0, Math.min(playerState.headPosition.y, FIELD_HEIGHT));
                playerState.segments.unshift({ ...playerState.headPosition });
                if (playerState.segments.length > SNAKE_INITIAL_LENGTH + playerState.queuedSegments) {
                    playerState.segments.pop();
                }
            }
        });
    });
}

function leaveSession(ws) {
    const session = getSessionByPlayerSocket(ws);
    if (session) {
        session.players = session.players.filter(player => player.ws !== ws);
        // if (session.players.length === 0) {
        //     sessions.delete(session.id);
        // }
    }

}

module.exports = { createOrFindSession, getPlayersInSession, getSession, getAllSessions, removePlayerFromSession, broadcastGameState, getSessionByPlayerSocket, handleMovement, movePlayers, leaveSession };
