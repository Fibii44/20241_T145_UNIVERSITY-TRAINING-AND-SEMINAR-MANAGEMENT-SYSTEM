import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import moment from 'moment';
import './activityLog.css';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const logsPerPage = 8;

    useEffect(() => {
        // Fetch initial logs
        const fetchLogs = async () => {
            try {
                const token = sessionStorage.getItem('authToken');
                const response = await axios.get('http://localhost:3000/a/activity-logs', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(response.data);
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
    const filteredLogs = logs.filter((log) =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moment(log.createdAt).format('YYYY-MM-DD HH:mm:ss').toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        return <div className="loading">Loading activity logs...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="activity-log-container">
            <h2 className="activity-log-header">Activity Logs</h2>
            <input
                type="text"
                placeholder="Search by action, date, or user..."
                className="activity-log-search"
                value={searchQuery}
                onChange={handleSearch}
            />
            <ul className="activity-log-list">
                {currentLogs.map((log) => (
                    <li key={log._id} className="activity-log-item">
                        <img 
                            src={log.userId?.profilePicture || '/default-profile.png'} 
                            alt="Profile" 
                            className="log-profile-picture" 
                        />
                        <div className="activity-log-details">
                            <p className="log-action">
                                <span className="user-name">{log.userId?.name}</span>
                                {log.action}
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
                <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                </span>
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