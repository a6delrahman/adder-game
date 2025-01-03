// Backend: services/srqAService.js
const Survey = require('../models/SrQaModel');

/**
 * Save a new SRQ-A survey to the database.
 * @param {Object} surveyData - The survey data to save.
 * @returns {Promise<Object>} The saved survey document.
 */
const saveSurvey = async (surveyData) => {
  try {
    const survey = new Survey(surveyData);
    return await survey.save();
  } catch (error) {
    console.error('Error saving survey:', error);
    throw error;
  }
};

module.exports = { saveSurvey };