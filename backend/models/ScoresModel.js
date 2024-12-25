const mongoose = require('mongoose');

const ScoresSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referenz zur User ID
    gameType: { type: String, required: true },
    score: { type: Number, default: 0 },
    eatenFood: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    playedAt: { type: Date, default: Date.now }
});

const Scores = mongoose.model('Score', ScoresSchema);

async function saveFinalScore(userId, gameType, finalStats) {
    try {
        const scoreEntry = new Scores({
            userId,
            gameType,
            score: finalStats.score,
            eatenFood: finalStats.eatenFood,
            correctAnswers: finalStats.correctAnswers,
            wrongAnswers: finalStats.wrongAnswers,
            playedAt: Date.now()
        });

        await scoreEntry.save();
    } catch (error) {
        throw new Error('Error saving final score:', error);
    }
}

async function getTopScores(gameType, limit = 10) {
    try {
        // Begrenze auf die Top-N-Ergebnisse
        return await Scores.find({gameType})
        .sort({score: -1}) // Sortiere nach Punktzahl absteigend
        .limit(limit);
    } catch (error) {
        console.error('Error fetching top scores:', error);
        return [];
    }
}


module.exports = {Scores, saveFinalScore, getTopScores};