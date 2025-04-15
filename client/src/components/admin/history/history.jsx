import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faClock, faMapMarkerAlt, faChevronLeft, faChevronRight, faSearch, faTh, faList } from '@fortawesome/free-solid-svg-icons';
import './history.css'; 
import { Link } from 'react-router-dom';
import Toast from '../../modals/successToast/toast'

const HistoryM = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState({ field: 'date', direction: 'asc' });
    const [viewMode, setViewMode] = useState('grid');
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 4;
    const maxPageNumbers = 5;
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };
      
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                setLoading(true);
                const response = await axios.get('http://localhost:3000/a/event-history', { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                const formattedEvents = response.data.events.map(event => ({
                    ...event,
                    eventDate: new Date(event.eventDate),
                }));
    
                setEvents(formattedEvents);
                setFilteredEvents(formattedEvents);
            } catch (error) {
                if (error.response) {
                    showToast(
                        `Error: ${error.response.status} - ${
                            error.response.data?.message || "Failed to fetch events from the server."
                        }`,
                        'error'
                    );
                } else if (error.request) {
                    showToast(
                        "Error: Unable to fetch events. Please check your network connection or try again later.",
                        'error'
                    );
                } else {
                    showToast(`Error: ${error.message}`, 'error');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Filter and sort events
    useEffect(() => {
        let filtered = [...events];
        
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            if (sortBy.field === 'date') {
                return sortBy.direction === 'asc' 
                    ? a.eventDate - b.eventDate 
                    : b.eventDate - a.eventDate;
            } else if (sortBy.field === 'title') {
                return sortBy.direction === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }
            return 0;
        });

        setFilteredEvents(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [events, searchQuery, sortBy]);

    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    return (
        <div className="dashboard-container">
            <div className="history-content">
                <div className="search-filter-container">
                    <div className="left-section">
                        <h2 className="dashboard-heading">Past Events</h2>
                        <div className="search-input-container">
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="filter-controls">
                        <div className="sort-group">
                            <label>Sort by:</label>
                            <select
                                value={sortBy.field}
                                onChange={(e) => setSortBy({ ...sortBy, field: e.target.value })}
                                className="custom-select"
                            >
                                <option value="date">Date</option>
                                <option value="title">Title</option>
                            </select>

                            <select
                                value={sortBy.direction}
                                onChange={(e) => setSortBy({ ...sortBy, direction: e.target.value })}
                                className="custom-select"
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="history-context-card">
                    <div className="history-events-grid">
                        {loading ? (
                            <p>Loading events...</p>
                        ) : currentEvents.length > 0 ? (
                            currentEvents.map(event => (
                                <Link to={`/a/events/${event._id}`} className="history-event-card" key={event._id}>
                                    <img
                                        src={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                                        alt={`${event.title || 'No'} image`}
                                        className="event-img"
                                        onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')}
                                    />
                                    <div className="event-details">
                                        <h3 className="event-title">{event.title}</h3>
                                        <p className="event-description">{event.description}</p>
                                        <div className="event-info">
                                            <span>
                                                <FontAwesomeIcon icon={faCalendarCheck} />{' '}
                                                {event.eventDate.toLocaleDateString()}
                                            </span>
                                            <span>
                                                <FontAwesomeIcon icon={faClock} />{' '}
                                                {event.eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </span>
                                            <span>
                                                <FontAwesomeIcon icon={faMapMarkerAlt} />{' '}
                                                {event.location}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p>No events found.</p>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredEvents.length > eventsPerPage && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            {(() => {
                                const pageNumbers = [];
                                // Calculate which group of 5 we're in
                                const currentGroup = Math.floor((currentPage - 1) / 5);
                                const startPage = currentGroup * 5 + 1;
                                const endPage = Math.min(startPage + 4, totalPages);

                                for (let i = startPage; i <= endPage; i++) {
                                    pageNumbers.push(
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            className={`page-button ${currentPage === i ? 'active' : ''}`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }
                                return pageNumbers;
                            })()}
                            <button
                                className="page-btn"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}
                </div>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </div>
    );
};

export default HistoryM;
