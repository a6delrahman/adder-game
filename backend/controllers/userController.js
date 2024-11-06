// controllers/userController.js
const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();
const User = require('../models/User');


exports.register = async (req, res) => {
    // Beispielhafte Registrierungslogik
    const { username, email, password } = req.body;
    // Registrierungsvorgang (z.B. Hashing, Speichern in DB) implementieren
    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new user
        user = new User({
            username,
            email,
            password: hashedPassword
        });
        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
    // res.json({ message: 'User registered successfully', username });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    // Login-Überprüfung und Authentifizierung implementieren
    res.json({ message: 'User logged in successfully', email });
};
