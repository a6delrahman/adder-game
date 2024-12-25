const equationTypes = {
    addition: generateAdditionEquation,
    subtraction: generateSubtractionEquation,
    multiplication: generateMultiplicationEquation,
    division: generateDivisionEquation
};

function generateAdditionEquation(level = 1) {
    const maxNumber = 10 * level; // Höhere Levels erlauben größere Zahlen
    const num1 = getRandomInt(1, maxNumber);
    const num2 = getRandomInt(1, maxNumber);
    return {
        equation: `${num1} + ${num2}`,
        result: num1 + num2,
        type: 'addition',
        level
    };
}

function generateSubtractionEquation(level = 1) {
    const maxNumber = 10 * level;
    const num1 = getRandomInt(1, maxNumber);
    const num2 = getRandomInt(1, num1); // Sicherstellen, dass num1 >= num2
    return {
        equation: `${num1} - ${num2}`,
        result: num1 - num2,
        type: 'subtraction',
        level
    };
}

function generateMultiplicationEquation(level = 1) {
    const maxNumber = 5 * level;
    const num1 = getRandomInt(1, maxNumber);
    const num2 = getRandomInt(1, maxNumber);
    return {
        equation: `${num1} * ${num2}`,
        result: num1 * num2,
        type: 'multiplication',
        level
    };
}

function generateDivisionEquation(level = 1) {
    const maxNumber = 5 * level;
    const num1 = getRandomInt(1, maxNumber);
    const num2 = getRandomInt(1, num1); // Sicherstellen, dass num1 >= num2
    return {
        equation: `${num1} / ${num2}`,
        result: num1 / num2,
        type: 'division',
        level
    };
}

function generateEquationByTypeAndLevel(type, level) {
    if (!equationTypes[type]) throw new Error(`Unsupported equation type: ${type}`);
    if (!level) return equationTypes[type](); // Standardlevel 1
    return equationTypes[type](level); // Typ-spezifische Generierungslogik mit Level
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    generateAdditionEquation,
    generateSubtractionEquation,
    generateMultiplicationEquation,
    generateDivisionEquation,
    generateEquationByTypeAndLevel,
};
