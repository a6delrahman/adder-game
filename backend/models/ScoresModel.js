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
    if (!userId || !gameType || !finalStats) {
        throw new Error('Missing required fields for saving final score');
    }
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
        console.error('Error saving final score:', error);
        throw new Error('Failed to save final score');
    }
}

async function getTopScores(gameType = null, limit = 10) {
    try {
        const query = gameType ? { gameType } : {};
        return await Scores.find(query)
            .populate('userId', 'username', 'correctAnswers', 'wrongAnswers')
            .sort({ score: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        console.error('Error fetching top scores:', error);
        return [];
    }
}


module.exports = {Scores, saveFinalScore, getTopScores};