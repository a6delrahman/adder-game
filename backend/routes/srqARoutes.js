// Backend: routes/srqARoutes.js
const express = require('express');
const { saveSurveyResponses, getSurveys } = require('../controllers/srqAController');
const router = express.Router();

router.post('/', saveSurveyResponses);
router.get('/surveys', getSurveys);

module.exports = router;