// controllers/userController.js
const userService = require('../services/userService');

// Benutzerprofil abrufen
exports.getUserProfile = async (req, res) => {
    try {
        const user =await userService.getUserProfile(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: err.message || 'Server error' });
    }
};

exports.getUsernameByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const username = await userService.getUsernameByUserId(userId);
        res.json({ username });
    } catch (err) {
        res.status(500).json({ msg: err.message || 'Server error' });
    }
}

// E-Mail aktualisieren
exports.updateEmail = async (req, res) => {
    const { email } = req.body;
    const userId = req.user.id;

    try {
        const message = await userService.updateEmail(userId, email);
        res.json({ msg: message });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

// Passwort aktualisieren
exports.updatePassword = async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id;

    try {
        const message = await userService.updatePassword(userId, password);
        res.json({ msg: message });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

// Benutzername aktualisieren
exports.updateUsername = async (req, res) => {
    const { username } = req.body;
    const userId = req.user.id;

    try {
        const message = await userService.updateUsername(userId, username);
        res.json({ msg: message });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

// Benutzer löschen
exports.deleteUser = async (req, res) => {
    const userId = req.user.id;

    try {
        const message = await userService.deleteUser(userId);
        res.json({ msg: message });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};
