import React, { useState, useEffect } from 'react';
import '../../../components/admin/navbars/topbar/topbar.css';
import Profile from "../../../assets/userProfile.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [user, setUser] = useState({ name: '', profilePicture: '', role: '', email: '' });
    const [notifications, setNotifications] = useState([]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleNotificationModal = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    // Fetch notifications for the logged-in user
    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            const decoded = jwtDecode(token);
            setUser({
                name: decoded.name,
                email: decoded.email,
                profilePicture: decoded.profilePicture,
                role: decoded.role,
            });

            // Fetch notifications from the server
            axios
                .get('http://localhost:3000/a/notification/items', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    const filteredNotifications = response.data.filter((notification) =>
                        notification.customParticipants.includes(decoded.email)  // Filter by logged-in email
                    );
                    setNotifications(filteredNotifications);
                })
                .catch((error) => {
                    console.error('Error fetching notifications:', error);
                });
        }
    }, []);

    return (
        <div className="topbar">
            <div className="search-admin">
                <i className="fa fa-search search-icon"></i>
                <input type="text" placeholder="Search..." />
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
                    <span className="role">{user.role}</span>
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
                        {notifications.map((notification) => (
                            <li key={notification.notificationId} className="notification-item">
                                <strong>{notification.title}</strong>
                                <p>{notification.message}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Topbar;
