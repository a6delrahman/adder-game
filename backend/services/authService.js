// services/authService.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const SECRET_KEY = '!dTW4S*UmP^BwVpbm#H7b!kNbn#n5yb^qPUxTspS^L5LqTmGP3^VndLS%v@T"';
const REFRESH_SECRET_KEY = 'tvYFPJ2qmg*7XFrnFmhFjb8weAn4d66%N%Zt56EjegLLGkD@2NffLp#K&D^T';

function authMiddleware(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // `Bearer <token>`
    if (!token) return res.status(401).json({msg: 'No token, authorization denied'});

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({msg: 'Token is not valid'});
    }
}

const refreshTokens = []; // Speicher für gültige Refresh Tokens (besser: Datenbank/Redis verwenden)

function generateAccessToken(user) {
    return jwt.sign(user, SECRET_KEY, {expiresIn: '1h'});
}

function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, REFRESH_SECRET_KEY);
    refreshTokens.push(refreshToken); // Speichere den Refresh Token
    return refreshToken;
}

async function registerUser(username, email, password) {
    // Überprüfen, ob der Benutzer bereits existiert
    let user = await User.findOne({email});
    if (user) throw new Error('User already exists');

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer erstellen und in der Datenbank speichern
    user = new User({username, email, password: hashedPassword});
    await user.save();

    const payload = {id: user._id};
    return {
        msg: 'User registered successfully',
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}

async function authenticateUser(email, password) {
    // Überprüfen, ob der Benutzer existiert
    const user = await User.findOne({email});
    if (!user) throw new Error('User not found');

    // Passwort überprüfen
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const payload = {id: user._id};
    return {
        msg: 'User authenticated successfully',
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
        user: {id: user._id, username: user.username, email: user.email},
    };
}

function validateRefreshToken(refreshToken) {
    if (!refreshTokens.includes(refreshToken)) {
        throw new Error('Invalid refresh token');
    }
    return jwt.verify(refreshToken, REFRESH_SECRET_KEY);
}

function revokeRefreshToken(refreshToken) {
    const index = refreshTokens.indexOf(refreshToken);
    if (index !== -1) refreshTokens.splice(index, 1);
}

module.exports = {
    authMiddleware,
    registerUser,
    authenticateUser,
    validateRefreshToken,
    generateAccessToken,
    revokeRefreshToken,
};
