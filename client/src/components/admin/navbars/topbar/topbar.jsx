import React, { useState, useEffect } from 'react';
import './topbar.css';
import Profile from "../../../../assets/default-profile.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [user, setUser] = useState({ name: '', profilePicture: '', role: '' });
    const [notifications, setNotifications] = useState([
        { id: 1, message: "New event added!" },
        { id: 2, message: "Meeting at 3 PM." },
        { id: 3, message: "Your password will expire soon." }
    ]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleNotificationModal = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    useEffect(() => {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (token) {
            const decoded = jwtDecode(token);
            setUser({
                name: decoded.name,
                email: decoded.email,
                profilePicture: decoded.profilePicture,
                role: decoded.role
            });
        }
    }, []);

    return (
        <div className="topbar">
            <div className="search-admin">

            </div>
            <div className="user-info">
                <div className="notification" onClick={toggleNotificationModal} style={{ cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={faBell} size="lg" />
                </div>
                <div className="profile">
                    <img src={user.profilePicture || Profile} alt="Admin Profile" />
                </div>
                <div className="user-details">
                    <span className="name" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                        {user.name}
                    </span>
                    <span className="role">Admin</span>
                </div>
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <ul>
                            <li>Profile</li>
                            <li>Settings</li>
                            <li>Logout</li>
                        </ul>
                    </div>
                )}
            </div>
            {isNotificationOpen && (
                <div className="notification-modal">
                    <div className="notification-header">
                        <h4>Notifications</h4>
                        <button onClick={toggleNotificationModal} className="close-btn">X</button>
                    </div>
                    <ul className="notification-list">
                        {notifications.map(notification => (
                            <li key={notification.id} className="notification-item">
                                {notification.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Topbar;
