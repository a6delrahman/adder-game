// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const SECRET_KEY = 'oaisdhfgoafojoi5ASDJGASGJ3245235WERTGWER2345"ç%2435"ç*%adsfSADF¨!!!"';

function authMiddleware(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // `Bearer <token>`
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}

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
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    return { msg: 'User registered successfully', token };
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

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    // Rückgabe, wenn die Anmeldung erfolgreich war
    return { msg: 'User authenticated successfully', token, user };
}

module.exports = { authMiddleware, registerUser, authenticateUser };
