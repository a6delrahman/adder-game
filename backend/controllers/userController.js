// controllers/userController.js
const express = require('express');
const userService = require('../services/userService');

const router = express.Router();

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Registrierung über den Service
        const response = await userService.registerUser(username, email, password);
        res.status(201).json(response);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ msg: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Authentifizierung über den Service
        const response = await userService.authenticateUser(email, password);
        res.status(200).json(response);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ msg: err.message });
    }
};
