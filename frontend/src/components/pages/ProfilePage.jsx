// src/components/pages/ProfilePage.jsx
import React, {useState, useEffect, useContext} from 'react';
import axiosInstance from '../../axiosInstance';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [editField, setEditField] = useState(null);
    const [newEmail, setNewEmail] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/api/users/me'); // Angepasste Instanz verwenden
                setUser(response.data);
                setNewEmail(response.data.email);
                setNewUsername(response.data.username);
            } catch (err) {
                setMessage(err.response?.data.msg);
                setIsAuthenticated(false);
            }
        };
        fetchUser();
    }, []);

    // Update Funktion für Email
    const handleEmailUpdate = async () => {
        try {
            const response = await axiosInstance.put('/api/users/update-email', { email: newEmail });
            setMessage(response.data.msg);
            setUser((prev) => ({ ...prev, email: newEmail }));
            setEditField(null); // Schließt das Bearbeitungsfeld
        } catch (err) {
            setMessage(err.response?.data.msg || 'Error updating email');
        }
    };

    // Update Funktion für Username
    const handleUsernameUpdate = async () => {
        try {
            const response = await axiosInstance.put('/api/users/update-username', { username: newUsername });
            setMessage(response.data.msg);
            setUser((prev) => ({ ...prev, username: newUsername }));
            setEditField(null); // Schließt das Bearbeitungsfeld
        } catch (err) {
            setMessage(err.response?.data.msg || 'Error updating username');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
            setMessage('Password must be at least 8 characters');
            return;
        }
        try {
            const response = await axiosInstance.put('/api/users/update-password', { password });
            setMessage(response.data.msg);
        } catch (err) {
            setMessage(err.response?.data.msg || 'Error updating password');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (confirmed) {
            try {
                await axiosInstance.delete('/api/users/delete');
                setIsAuthenticated(false);
                navigate('/'); // Redirect to homepage after deletion
            } catch (err) {
                setMessage('Error deleting account');
            }
        }
    };

    return (
        <div className="profile-page">
            <h1>User Profile</h1>
            <p>Here, you can update your personal information by clicking Change, Update Email or change password to make changes. If you ever wish to deactivate your account, use the Delete Account option at the bottom. Be cautious, as this action is permanent.</p>
            {message && <p>{message}</p>}
            {user ? (
                <div className='profileFields'>
                    {/* Benutzername */}
                    <div className="profile-field-username">
                        <label>Username:</label>
                        {editField === 'username' ? (
                            <div>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                />
                                <button onClick={handleUsernameUpdate}>Apply</button>
                            </div>
                        ) : (
                            <div>
                                <span>{user.username}</span>
                                <button onClick={() => setEditField('username')}>Change</button>
                            </div>
                        )}
                    </div>

                    {/* E-Mail */}
                    <div className="profile-field-email">
                        <label>Email:</label>
                        {editField === 'email' ? (
                            <div>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                                <button onClick={handleEmailUpdate}>Apply</button>
                            </div>
                        ) : (
                            <div>
                                <span>{user.email}</span>
                                <button onClick={() => setEditField('email')}>Update Email</button>
                            </div>
                        )}
                    </div>

                    {/* E-Mail */}
                    <form className='profile-password' onSubmit={handlePasswordChange}>
                        
                    {editField === 'password' ? (
                        <div>
                            <input
                                type="password"
                                placeholder="New password (min 8 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required/>
                            <button onClick={handlePasswordChange}>Apply</button>
                        </div>
                       ) : (
                            <div>
                                <span>{user.password}</span>
                                <button onClick={() => setEditField('password')}>Change Password</button>
                            </div>
                        )}
                    <button onClick={handleDeleteAccount} className="delete-account-btn">
                        Delete Account
                    </button>

                    </form>


                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default ProfilePage;
