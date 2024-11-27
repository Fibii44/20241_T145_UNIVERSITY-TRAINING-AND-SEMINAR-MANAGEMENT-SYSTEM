import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faClock, faPlus, faMapMarkerAlt, faLock, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './history.css'; 

const HistoryM = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [currentPage, setCurrentPage] = useState(1); 
    const eventsPerPage = 4;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:3000/a/events');
                const formattedEvents = response.data.map(event => ({
                    ...event,
                    eventDate: new Date(event.eventDate),
                }));
                setEvents(formattedEvents);
            } catch (error) {
                console.error('Error fetching events:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const pastEvents = events.filter(event => event.eventDate < new Date());

    // Filter past events based on search query
    const filteredEvents = pastEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <div className="dashboard-container">
            <div className="content">
                <h2 className="dashboard-heading">Past Events</h2>
                
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search past events..."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset to the first page on new search
                    }}
                />

                <div className="history-context-card">
                    <div className="history-events-list">
                        {loading ? (
                            <p>Loading events...</p>
                        ) : currentEvents.length > 0 ? (
                            <div className="history-events-grid">
                                {currentEvents.map(event => (
                                    <div
                                        className="history-event-card"
                                       key={event._id}
                                        onClick={() => navigate(`/history/${event._id}`)}
                                    >
                                        <img
                                            src={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                                            alt={`${event.title || 'No'} image`}
                                            className="event-img"
                                            onError={(e) =>
                                                (e.target.src = '/src/assets/default-eventPicture.jpg')
                                            }
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
                                                    {event.eventDate.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                </span>
                                                <span>
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} />{' '}
                                                    {event.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No past events found.</p>
                        )}
                    </div>

                                        {/* Pagination Controls */}
                    {filteredEvents.length > eventsPerPage && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                const startPage = Math.max(
                                    1,
                                    Math.min(totalPages - 4, currentPage - 2)
                                );
                                const pageNumber = startPage + index;
                                return (
                                    <button
                                        key={pageNumber}
                                        className={`page-button ${
                                            currentPage === pageNumber ? 'active' : ''
                                        }`}
                                        onClick={() => handlePageChange(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                            <button
                                className="page-btn"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                }
                                disabled={currentPage === totalPages}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default HistoryM;
