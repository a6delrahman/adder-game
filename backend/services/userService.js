// services/userService.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function registerUser(username, email, password) {
    // Überprüfen, ob der Benutzer bereits existiert
    let user = await User.findOne({ email });
    if (user) {
        throw new Error('User already exists');
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer erstellen und in der Datenbank speichern
    user = new User({
        username,
        email,
        password: hashedPassword
    });
    await user.save();

    return { msg: 'User registered successfully' };
}

async function authenticateUser(email, password) {
    // Überprüfen, ob der Benutzer existiert
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    // Passwort überprüfen
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Rückgabe, wenn die Anmeldung erfolgreich war
    return { msg: 'User authenticated successfully', user };
}

module.exports = { registerUser, authenticateUser };
