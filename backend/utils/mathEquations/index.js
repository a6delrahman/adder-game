const {
    generateAdditionEquation,
    generateSubtractionEquation,
    generateMultiplicationEquation,
    generateDivisionEquation,
    generateEquationByTypeAndLevel
} = require('./equationGenerator');
const {
    initializeEquationsForSession,
    addEquationsForSession,
    removeEquationsForSession,
    assignEquationToPlayer
} = require('./equationManager');

module.exports = {
    equationGenerator: {
        generateAdditionEquation,
        generateSubtractionEquation,
        generateMultiplicationEquation,
        generateDivisionEquation,
        generateEquationByTypeAndLevel,
    },
    equationManager: {
        initializeEquationsForSession,
        addEquationsForSession,
        removeEquationsForSession,
        assignEquationToPlayer
    }
};
