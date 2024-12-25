const sessionEquations = new Map(); // { sessionId: { addition: [], subtraction: [] } }
const {generateEquationByTypeAndLevel} = require('./equationGenerator');

function initializeEquationsForSession(sessionId, equationType) {
    // Initialisiere leere Gleichungen für die Session
    sessionEquations.set(sessionId, {[equationType]: []});
}

function addEquationsForSession(sessionId, equationType, count, level) {
    const session = sessionEquations.get(sessionId);
    if (!session) {
        console.error(`Session ${sessionId} not found!`);
        return;
    }

    // Generiere zusätzliche Gleichungen
    for (let i = 0; i < count; i++) {
        session[equationType].push(generateEquationByTypeAndLevel(equationType, level));
    }
}

function removeEquationsForSession(sessionId) {
    if (!sessionEquations.has(sessionId)){
        console.error(`Session ${sessionId} not found!`);
        return;
    }
    sessionEquations.delete(sessionId);
}

function assignEquationToPlayer(sessionId, playerState, equationType) {
    const session = sessionEquations.get(sessionId);
    if (!session || !session[equationType]) {
        console.error(`No equations available for session ${sessionId} and type ${equationType}`);
        return;
    }

    // Stelle sicher, dass genügend Gleichungen vorhanden sind
    if (session[equationType].length === 0) {
        console.warn(`No equations left for session ${sessionId}, generating more...`);
        addEquationsForSession(sessionId, equationType, 5, playerState.level || 1);
    }

    // Weise die nächste Gleichung zu
    playerState.currentEquation = session[equationType].pop();
}

module.exports = {
    initializeEquationsForSession,
    addEquationsForSession,
    removeEquationsForSession,
    assignEquationToPlayer
};
