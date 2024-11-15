// controllers/authController.js
const authService = require('../services/authService');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Registrierung über den Service
        const response = await authService.registerUser(username, email, password);
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
        const response = await authService.authenticateUser(email, password);
        res.status(200).json(response);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ msg: err.message });
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ msg: 'No refresh token provided' });

    try {
        const user = authService.validateRefreshToken(refreshToken);
        const newAccessToken = authService.generateAccessToken({ id: user.id });
        res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(403).json({ msg: err.message });
    }
};

exports.logout = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ msg: 'No refresh token provided' });

    authService.revokeRefreshToken(refreshToken);
    res.status(200).json({ msg: 'User logged out successfully' });
};
