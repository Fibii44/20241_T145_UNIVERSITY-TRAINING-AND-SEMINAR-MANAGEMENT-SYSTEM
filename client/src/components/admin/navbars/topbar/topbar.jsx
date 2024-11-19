import React, { useState, useEffect } from 'react';
import './topbar.css';
import Profile from "../../../../assets/adminProfile.png"; // Imported Profile image
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import jwtDecode from 'jwt-decode';

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [user, setUser] = useState({ name: '', profilePicture: '', role: '' });
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'New user registered', time: '2 mins ago' },
        { id: 2, text: 'Server downtime alert', time: '10 mins ago' },
        { id: 3, text: 'Event created successfully', time: '1 hour ago' },
    ]);
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const toggleNotifications = () => {
        console.log('Bell icon clicked!');
        setIsNotificationOpen((prev) => !prev);
    };

    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if(token){
            const decoded = jwtDecode(token);
            console.log('Decoded Profile Picture:', decoded.profilePicture);
            setUser({
                name: decoded.name,
                email: decoded.email,
                profilePicture: decoded.profilePicture,
                role: decoded.role
            })
        }
    }, []);
    useEffect(() => {
        console.log('Notification dropdown open state:', isNotificationOpen);
    }, [isNotificationOpen]);
    return (
        <div className="topbar">
            <div className="search-admin">
                <i className="fa fa-search search-icon"></i>
                <input type="text" placeholder="Search..." />
            </div>
            <div className="user-info">
            <div className="notification" onClick={toggleNotifications}>
                    <FontAwesomeIcon icon={faBell} size="lg" />
                    {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                    {isNotificationOpen && (
                        <div className="notification-dropdown">
                            <ul>
                                {notifications.map((notification) => (
                                    <li key={notification.id}>
                                        <span>{notification.text}</span>
                                        <small>{notification.time}</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
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
        </div>
    );
};

export default Topbar;