const mongoose = require('mongoose');

const equationSchema = new mongoose.Schema({
    equation: String,
    result: Number,
    type: {type: String, enum: ['addition', 'subtraction', 'multiplication', 'division']},
    difficulty: Number // Optional für Schwierigkeitsgrad
});

const Equation = mongoose.model('Equation', equationSchema);

async function getEquationsByType(type, limit = 10) {
    return await Equation.find({type}).limit(limit).exec();
}

async function saveEquation(equation) {
    const newEquation = new Equation(equation);
    return await newEquation.save();
}

module.exports = {
    Equation,
    getEquationsByType,
    saveEquation
};
