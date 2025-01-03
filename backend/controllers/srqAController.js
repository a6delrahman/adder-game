
// Backend: controllers/srqAController.js
const { saveSurvey } = require('../services/srqAService');

/**
 * Handle saving SRQ-A survey responses.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
const saveSurveyResponses = async (req, res) => {
  const { responses } = req.body;

  const intrinsic = (responses.mot1 + responses.mot5 + responses.mot9 + responses.mot13 + responses.mot17) / 5;
  const identified = (responses.mot3 + responses.mot7 + responses.mot11 + responses.mot15) / 4;
  const introjected = (responses.mot2 + responses.mot6 + responses.mot10 + responses.mot14) / 4;
  const external = (responses.mot4 + responses.mot8 + responses.mot12 + responses.mot16) / 4;

  const sdi = (2 * intrinsic) + identified - introjected - (2 * external);

  const surveyData = {
    responses,
    intrinsic,
    identified,
    introjected,
    external,
    sdi,
  };

  try {
    const savedSurvey = await saveSurvey(surveyData);
    res.status(200).send({ message: 'Fragebogen erfolgreich gespeichert!', sdi, savedSurvey });
  } catch (error) {
    res.status(500).send({ error: 'Fehler beim Speichern des Fragebogens.' });
  }
};

/**
 * Get all surveys from the database.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
const getSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Surveys.' });
  }
};

module.exports = { saveSurveyResponses, getSurveys };
