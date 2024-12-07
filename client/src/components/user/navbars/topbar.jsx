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


    useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
        const decoded = jwtDecode(token);
        setUser({
            name: decoded.name,
            email: decoded.email,
            profilePicture: decoded.profilePicture,
            role: decoded.role,
            department: decoded.department
        });

        // Fetch notifications from the server
        axios.get('http://localhost:3000/a/notification/items', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                // Filter notifications for the current user and exclude removed ones
                const filteredNotifications = response.data.map((notification) => {
                    const relevantUserNotifications = notification.userNotifications?.filter(
                        (userNotif) => {
                            // Check if the participant group is "all" or if it is for the current user
                            const isForAllUsers = notification.participantGroup === "all";
                            return (isForAllUsers || userNotif.userId === decoded.id) && !userNotif.removedStatus;
                        }
                    );

                    return relevantUserNotifications.length > 0
                        ? { ...notification, userNotifications: relevantUserNotifications }
                        : null;
                }).filter(Boolean); // Remove null entries

                setNotifications(filteredNotifications);
            })
            .catch((error) => {
                console.error('Error fetching notifications:', error);
            });
    }
}, []);


    const handleViewEvent = async (notificationId, eventId) => {
        const token = sessionStorage.getItem("authToken");
    
        if (token) {
            const decoded = jwtDecode(token);
            const userId = decoded.id; // Get the user's ID from the decoded token
    
            try {
                const response = await axios.put(
                    `http://localhost:3000/a/notification/update/${notificationId}`,
                    { userId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
    
                if (response.status === 200) {
                    setNotifications((prevNotifications) =>
                        prevNotifications.map((notification) => {
                            if (notification._id === notificationId) {
                                return {
                                    ...notification,
                                    userNotifications: notification.userNotifications.map((userNotif) =>
                                        userNotif.userId === userId && !userNotif.removedStatus
                                            ? { ...userNotif, status: 'read', readAt: new Date() }
                                            : userNotif
                                    ),
                                };
                            }
                            return notification;
                        })
                    );
    
                    // Navigate to the event page
                    window.location.href = `/u/events/${eventId}`;
                }
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }
    };

    const handleRemoveNotification = async (notificationId) => {
        const token = sessionStorage.getItem('authToken');
        const decoded = jwtDecode(token);
    
        if (token) {
            try {
                const response = await axios.put(
                    `http://localhost:3000/a/notification/remove/${notificationId}`,
                    { userId: decoded.id }, // Send userId as part of the request
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
    
                if (response.status === 200) {
                    setNotifications((prevNotifications) =>
                        prevNotifications.filter((notification) => notification._id !== notificationId)
                    );
                }
            } catch (error) {
                console.error("Error removing notification:", error);
            }
        }
    };
    
    const hasUnreadNotifications = notifications.some(notification =>
        notification.userNotifications &&
        notification.userNotifications.some(userNotif => userNotif.status === 'unread')
    );

    return (
        <div className="topbar">
            <div className="search-admin"></div>
            <div className="user-info">
                <div className="notification" onClick={toggleNotificationModal} style={{ cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={faBell} size="lg" />
                    {hasUnreadNotifications && <div className="unread-circle"></div>}
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
                            <li key={notification._id} className="notification-item">
                                <strong>{notification.title}</strong>
                                <p>{notification.message}</p>
                                <Link
                                    to={`/u/events/${notification.eventId}`}
                                    className="view-event-link"
                                    onClick={() => handleViewEvent(notification._id, notification.eventId)}
                                >
                                    View Event
                                </Link>

                                {notification.userNotifications && notification.userNotifications.some(userNotif => userNotif.status === 'unread')
                                    ? <span className="unread-text">Unread</span>
                                    : <span className="read-text">Read</span>
                                }

                                {/* Add a Remove Button */}
                                <button onClick={() => handleRemoveNotification(notification._id)} className="remove-notification-btn">
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


export default Topbar;
