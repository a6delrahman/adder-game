const {
    generateAdditionEquation,
    generateSubtractionEquation,
    generateMultiplicationEquation,
    generateDivisionEquation,
    generateEquationByTypeAndLevel
} = require('./equationGenerator');
const {initializeEquationsForSession, addEquationsForSession, assignEquationToPlayer} = require('./equationManager');

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
        assignEquationToPlayer
    }
};
