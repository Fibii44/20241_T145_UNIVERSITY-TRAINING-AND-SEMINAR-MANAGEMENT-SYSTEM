import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Profile from "../../../assets/default-profile.png";
import io from 'socket.io-client';
import axios from 'axios';
import moment from 'moment';
import './activityLog.css';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const logsPerPage = 8;

    
    useEffect(() => {
        // Check if user has access to this page
        const checkAccess = async () => {
            try {
                const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
                const response = await fetch("http://localhost:3000/a/activity-logs", {
                    method: "GET",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                    });
            
                    if (response.status === 403) {
                        // Redirect to a different page if access is denied
                        navigate("/a/dashboard"); // Change this to your desired redirect path
                    }
                    } catch (error) {
                        console.error("Access check failed:", error);
                    }
                };
        checkAccess();
    }, []);


    useEffect(() => {
        // Fetch initial logs
        const fetchLogs = async () => {
            try {
                const token = sessionStorage.getItem('authToken');
                const response = await axios.get('http://localhost:3000/a/activity-logs', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const sortedLogs = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort logs by date
                setLogs(sortedLogs);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching logs:', error);
                setError('Failed to load activity logs');
                setLoading(false);
            }
        };


        fetchLogs();

        // Set up Socket.IO connection
        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        socket.on('newActivity', (activity) => {
            setLogs(prevLogs => {
                const newLog = {
                    ...activity,
                    userId: {
                        name: activity.userName,
                        profilePicture: activity.userProfile
                    },
                    createdAt: new Date()
                };
                return [newLog, ...prevLogs];
            });
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Filter logs based on search query
    const filteredLogs = logs.filter((log) => {
        const searchLower = searchQuery.toLowerCase().trim();
        
        // If search query is empty, return all logs
        if (!searchLower) return true;

        // Check if search query is a date
        const searchDate = moment(searchLower, [
            'YYYY-MM-DD',
            'MM-DD-YYYY',
            'DD-MM-YYYY',
            'MMMM D, YYYY',
            'MMM D, YYYY',
            'D MMM YYYY',
            'D MMMM YYYY'
        ], true);

        // If search query is a valid date
        if (searchDate.isValid()) {
            const logDate = moment(log.createdAt);
            return logDate.format('YYYY-MM-DD') === searchDate.format('YYYY-MM-DD');
        }

        // Search in action
        if (log.action.toLowerCase().includes(searchLower)) return true;

        // Search in user name
        if (log.userId?.name?.toLowerCase().includes(searchLower)) return true;

        // Search in timestamp with multiple formats
        const logDate = moment(log.createdAt);
        const dateFormats = [
            logDate.format('YYYY-MM-DD'),
            logDate.format('MM-DD-YYYY'),
            logDate.format('DD-MM-YYYY'),
            logDate.format('MMMM D, YYYY'),
            logDate.format('MMM D, YYYY'),
            logDate.format('D MMM YYYY'),
            logDate.format('D MMMM YYYY')
        ];

        return dateFormats.some(format => format.toLowerCase().includes(searchLower));
    });

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const startIndex = (currentPage - 1) * logsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loader"></div>
            </div>
        );
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="activity-log-container">
            <h2 className="activity-log-header">Activity Logs</h2>
            <input
                type="text"
                placeholder="Search by action, date (e.g., 2024-03-15, Mar 15 2024), or user..."
                className="activity-log-search"
                value={searchQuery}
                onChange={handleSearch}
            />
            <ul className="activity-log-list">
                {currentLogs.map((log) => (
                    <li key={log._id} className="activity-log-item">
                        <img 
                            src={log.userId?.profilePicture || Profile} 
                            alt="Profile" 
                            onError={(e) => {
                                e.target.src = '/src/assets/profile.png';
                            }}
                            className="log-profile-picture" 
                        />
                        <div className="activity-log-details">
                            <p className="log-action">
                                <span className="user-name">{log.userId?.name}</span> {log.action}
                                {log.details?.eventId && (
                                    <span className="event-name">{log.details.eventTitle}</span>
                                )}
                            </p>
                            <p className="log-timestamp">
                                {moment(log.createdAt).format('MMMM D, YYYY h:mm A')}
                            </p>
                        </div>
                    </li>
                ))}
                {filteredLogs.length === 0 && (
                    <p className="no-logs-message">No logs match your search criteria.</p>
                )}
            </ul>
            <div className="pagination-controls">
                <button 
                    onClick={handlePrevious} 
                    disabled={currentPage === 1} 
                    className="pagination-button"
                >
                    Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                        // If total pages is 5 or less, show all pages
                        pageNumber = i + 1;
                    } else {
                        // If current page is near the start
                        if (currentPage <= 3) {
                            pageNumber = i + 1;
                        }
                        // If current page is near the end
                        else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                        }
                        // If current page is in the middle
                        else {
                            pageNumber = currentPage - 2 + i;
                        }
                    }
                    
                    return (
                        <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
                <button 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages} 
                    className="pagination-button"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ActivityLog;