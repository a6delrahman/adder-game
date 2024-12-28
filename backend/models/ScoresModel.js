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
async function saveFinalScore(finalStats) {
    const {userId, gameType, score, eatenFood, correctAnswers, wrongAnswers} = finalStats;
    if (!userId || !gameType) {
        throw new Error('Missing required fields for saving final score');
    }
    try {
        const scoreEntry = new Scores({
            userId,
            gameType,
            score,
            eatenFood,
            correctAnswers,
            wrongAnswers,
            playedAt: Date.now()
        });

        await scoreEntry.save();
        console.log('Final score saved successfully');
    } catch (error) {
        console.error('Error saving final score:', error);
        throw new Error('Failed to save final score');
    }
}

async function getTopScores(gameType = null, username = null, limit = 10) {
    try {
        const query = {};
        if (gameType) query.gameType = gameType;
        if (username) {
            const user = await mongoose.model('User').findOne({ username }).select('_id');
            if (user) {
                query.userId = user._id;
                query.userId.username = user.username;
            } else {
                throw new Error('User not found');  // No user found with the given username
            }
        }

        return await Scores.find(query)
            .populate('userId', 'username')
            .sort({ score: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        console.error('Error fetching top scores:', error);
        return [];
    }
}


module.exports = {Scores, saveFinalScore, getTopScores};