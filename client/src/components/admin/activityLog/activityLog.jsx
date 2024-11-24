import React, { useState } from 'react';
import './activityLog.css';

const ActivityLog = () => {
    const logs = [
        { id: 1, action: 'User John Doe added a new event', timestamp: '2024-11-23 10:30 AM', profile: 'https://i1.sndcdn.com/artworks-ni2AePohJoooy2Nr-qHH4aA-t500x500.jpg' },
        { id: 2, action: 'Admin updated seminar details', timestamp: '2024-11-22 04:45 PM', profile: 'https://i1.sndcdn.com/artworks-ni2AePohJoooy2Nr-qHH4aA-t500x500.jpg' },
        { id: 3, action: 'User Jane Smith registered for a workshop', timestamp: '2024-11-21 02:15 PM', profile: 'https://i1.sndcdn.com/artworks-ni2AePohJoooy2Nr-qHH4aA-t500x500.jpg' },
        { id: 4, action: 'System auto-synced calendar with Google', timestamp: '2024-11-20 12:00 PM', profile: 'https://i1.sndcdn.com/artworks-ni2AePohJoooy2Nr-qHH4aA-t500x500.jpg' },
        // Add more mock logs here
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 8;

    // Filter logs based on search query
    const filteredLogs = logs.filter((log) =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.timestamp.toLowerCase().includes(searchQuery.toLowerCase())
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
        setCurrentPage(1); // Reset to the first page when searching
    };

    return (
        <div className="activity-log-container">
            <h2 className="activity-log-header">Activity Logs</h2>
            <input
                type="text"
                placeholder="Search activity logs..."
                className="activity-log-search"
                value={searchQuery}
                onChange={handleSearch}
            />
            <ul className="activity-log-list">
                {currentLogs.map((log) => (
                    <li key={log.id} className="activity-log-item">
                        <img src={log.profile} alt="Profile" className="log-profile-picture" />
                        <div className="activity-log-details">
                            <p className="log-action">{log.action}</p>
                            <p className="log-timestamp">{log.timestamp}</p>
                        </div>
                    </li>
                ))}
                {filteredLogs.length === 0 && (
                    <p className="no-logs-message">No logs match your search criteria.</p>
                )}
            </ul>
            <div className="pagination-controls">
                <button onClick={handlePrevious} disabled={currentPage === 1} className="pagination-button">
                    Previous
                </button>
                <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                </span>
                <button onClick={handleNext} disabled={currentPage === totalPages} className="pagination-button">
                    Next
                </button>
            </div>
        </div>
    );
};

export default ActivityLog;
