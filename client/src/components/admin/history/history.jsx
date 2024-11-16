import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios'; // Ensure axios is imported
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faClock, faPlus, faMapMarkerAlt, faLock, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './history.css'; // Ensure you define grid styles here

const HistoryM = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Manage pagination state
    const eventsPerPage = 5;

    // Fetch events when the component mounts
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:3000/a/events');
                // Format events, ensuring eventDate is a Date object
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

    // Filter events to show only past events
    const pastEvents = events.filter(event => event.eventDate < new Date());

    // Get current page events
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = pastEvents.slice(indexOfFirstEvent, indexOfLastEvent);

    // Handle page navigation
    const totalPages = Math.ceil(pastEvents.length / eventsPerPage);
    const handlePageChange = (page) => setCurrentPage(page);
    const nextPage = () => {
        if (currentPage < Math.ceil(events.length / eventsPerPage)) {
          setCurrentPage(currentPage + 1);
        }
      };
    
      const prevPage = () => {
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      };
    return (
        <div className="dashboard-container">
            <div className="content">
                <h2 className="dashboard-heading">Past Events</h2>
                <div className="context-card">
                    <div className="history-events-list">
                        {loading ? (
                            <p>Loading events...</p>
                        ) : currentEvents.length > 0 ? (
                            <div className="history-events-grid">
                                {currentEvents.map(event => (
                                    <div
                                        className="event-card"
                                        key={event._id}
                                        onClick={() => navigate(`/events/${event._id}`)}
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
                    {pastEvents.length > eventsPerPage && (
                        <div className="pagination">
                            <button onClick={prevPage} disabled={currentPage === 1}>
                                <FontAwesomeIcon icon={faChevronLeft} /> Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    className={`page-button ${
                                        currentPage === index + 1 ? 'active' : ''
                                    }`}
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </button>
                                
                            ))}
                            <button onClick={nextPage} disabled={currentPage === Math.ceil(events.length / eventsPerPage)}>
                                Next <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryM;