const express = require('express');
const router = express.Router();
const { getTopScores } = require('../models/ScoresModel');

router.get('', async (req, res) => {
    const { gameType, username } = req.query;

    try {
        const scores = await getTopScores(gameType, username);
        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;