// services/userService.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// E-Mail aktualisieren
async function updateEmail(userId, newEmail) {
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) throw new Error('Email is already in use');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.email = newEmail;
    await user.save();
    return 'Email updated successfully';
}

// Passwort aktualisieren
async function updatePassword(userId, newPassword) {
    if (newPassword.length < 8) throw new Error('Password must be at least 8 characters');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return 'Password updated successfully';
}

// Benutzername aktualisieren
async function updateUsername(userId, newUsername) {
    const usernameExists = await User.findOne({ username: newUsername });
    if (usernameExists) throw new Error('Username is already in use');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.username = newUsername;
    await user.save();
    return 'Username updated successfully';
}

// Benutzer löschen
async function deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new Error('User not found');
    return 'User deleted successfully';
}

async function getUserProfile(userId) {
    // Findet den Benutzer anhand der ID und gibt nur die Felder `username` und `email` zurück
    const user = await User.findById(userId).select('username email');
    if (!user) throw new Error('User not found');
    return user;
}


async function getUsernameByUserId(userId) {
    if (!db.connected) throw new Error('Database connection error');
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        return user.username;
    } catch (error) {
        if (error.message.includes('failed to connect')) {
            throw new Error('Database connection error');
        }
        throw error;
    }
}

module.exports = {
    updateEmail,
    updatePassword,
    updateUsername,
    deleteUser,
    getUserProfile,
    getUsernameByUserId
};
