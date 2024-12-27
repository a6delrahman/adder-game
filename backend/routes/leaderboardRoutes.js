const express = require('express');
const router = express.Router();
const { getTopScores } = require('../models/ScoresModel');

router.get('', async (req, res) => {
    try {
        const scores = await getTopScores(); // No gameType parameter passed
        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;