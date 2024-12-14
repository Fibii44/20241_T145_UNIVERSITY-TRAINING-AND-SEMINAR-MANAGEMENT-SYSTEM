import React, { useState, useEffect } from 'react';
import '../../../components/admin/navbars/topbar/topbar.css';
import Profile from "../../../assets/userProfile.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { use } from 'react';

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [user, setUser] = useState({ name: '', profilePicture: '', role: '', email: '' });
    const [notifications, setNotifications] = useState([]);
    const [events, setEvents] = useState([]);
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleNotificationModal = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:3000/u/events', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
                });
                setEvents(response.data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
    
        fetchEvents();
    }, []);
    
    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            const decoded = jwtDecode(token);
            setUser({
                name: decoded.name,
                email: decoded.email,
                profilePicture: decoded.profilePicture,
                role: decoded.role,
                department: decoded.department,
            });
    
            // Fetch notifications
            axios
                .get('http://localhost:3000/u/notification/items', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    const filteredNotifications = response.data.map((notification) => {
                        const relevantUserNotifications = notification.userNotifications?.filter(
                            (userNotif) => {
                                const isForAllUsers = notification.participantGroup === 'all';
                                return (isForAllUsers || userNotif.userId === decoded.id) && !userNotif.removedStatus;
                            }
                        );
    
                        return relevantUserNotifications.length > 0
                            ? { ...notification, userNotifications: relevantUserNotifications }
                            : null;
                    }).filter(Boolean);
    
                    // Map events to notifications
                    const notificationsWithImages = filteredNotifications.map((notification) => {
                        const event = events.find((e) => e._id === notification.eventId);
                        return {
                            ...notification,
                            eventPicture: event ? event.eventPicture : null,
                        };
                    });
    
                    setNotifications(notificationsWithImages);
                })
                .catch((error) => {
                    console.error('Error fetching notifications:', error);
                });
        }
    }, [events]); // Re-run this effect whenever events change
    

    const handleViewEvent = async (notificationId, eventId) => {
        const token = sessionStorage.getItem('authToken');
        const decoded = jwtDecode(token);
    
        if (token) {
            try {
                const response = await axios.patch(
                    `http://localhost:3000/u/notification/update/${notificationId}`,
                    { userId: decoded.id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
    
                if (response.status === 200) {
                    // Update the notification state
                    setNotifications((prevNotifications) =>
                        prevNotifications.map((notification) => {
                            if (notification._id === notificationId) {
                                return {
                                    ...notification,
                                    userNotifications: notification.userNotifications.map((userNotif) =>
                                        userNotif.userId === decoded.id
                                            ? { ...userNotif, status: 'read', readAt: new Date() }
                                            : userNotif
                                    ),
                                };
                            }
                            return notification;
                        })
                    );
    
                    // Redirect to the event page
                    window.location.href = `/u/events/${eventId}`;
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }
    };
    
    const timeAgo = (timestamp) => {
        const now = new Date();
        const createdAt = new Date(timestamp);
        const differenceInSeconds = Math.floor((now - createdAt) / 1000);
    
        if (differenceInSeconds < 60) return `${differenceInSeconds} seconds ago`;
        const differenceInMinutes = Math.floor(differenceInSeconds / 60);
        if (differenceInMinutes < 60) return `${differenceInMinutes} minutes ago`;
        const differenceInHours = Math.floor(differenceInMinutes / 60);
        if (differenceInHours < 24) return `${differenceInHours} hours ago`;
        const differenceInDays = Math.floor(differenceInHours / 24);
        return `${differenceInDays} days ago`;
    };
    
    const handleRemoveNotification = async (notificationId) => {
        const token = sessionStorage.getItem('authToken');
        const decoded = jwtDecode(token);
    
        if (token) {
            try {
                const response = await axios.patch(
                    `http://localhost:3000/u/notification/remove/${notificationId}`,
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
    // Compute user role dynamically
    const getRoleDisplay = (role) => {
        switch (role) {
            case 'faculty_staff':
                return 'Staff';
            case 'admin':
                return 'Administrator';
            default:
                return 'User'; // Fallback for unknown roles
        }
    };

    return (
        <div className="topbar">
            <div className="search-admin"></div>
            <div className="user-info">
            <div className="notification" onClick={toggleNotificationModal} style={{ cursor: 'pointer', position: 'relative' }}>
                <FontAwesomeIcon icon={faBell} size="lg" />
                {hasUnreadNotifications && <div className="unread-circle"></div>}
            </div>
                <Link to={`/u/profile`}>
                <div className="profile">
                    <img src={user.profilePicture || Profile} alt="Admin Profile" />
                </div>
                </Link>
                <div className="user-details">
                    <span className="name" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                        {user.name}
                    </span>
                    <span className="role">{getRoleDisplay(user.role)}</span>
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
                        <button onClick={toggleNotificationModal} className="close-btn"><i className="fas fa-times"></i></button>
                    </div>
                    <ul className="notification-list">
                        {notifications.map((notification) => {
                            const isUnread = notification.userNotifications?.some(
                                (userNotif) => userNotif.status === 'unread'
                            );

                            return (
                                <Link
                                    to={`/u/events/${notification.eventId}`}
                                    className="view-event-link"
                                    onClick={() => handleViewEvent(notification._id, notification.eventId)}
                                    key={notification._id}
                                >
                                    <li
                                        className={`notification-item ${isUnread ? 'unread' : 'read'}`}
                                    >
                                        <div className="item-img">
                                            <img
                                                src={`http://localhost:3000/eventPictures/${notification.eventPicture}`}
                                                alt={notification.title}
                                                className="event-image"
                                                onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')}
                                            />
                                        </div>
                                        <div className="item-content">
                                            <strong>{notification.title}</strong>
                                            <p>{notification.message}</p>
                                            <strong>{timeAgo(notification.createdAt)}</strong>

                                        </div>
                                        <div className="item-setting">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleRemoveNotification(notification._id);
                                                }}
                                                className="remove-notification-btn"
                                            >
                                                <i className="fas fa-times"></i> {/* FontAwesome X icon */}
                                            </button>
                                        </div>

                                    </li>
                                </Link>
                            );
                        })}
                    </ul>

                </div>
            )}
        </div>
    );
};


export default Topbar;
