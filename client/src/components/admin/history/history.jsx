import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faClock, faMapMarkerAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './history.css'; 
import { Link } from 'react-router-dom';

const HistoryM = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('all');
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 4;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                setLoading(true);
                const response = await axios.get('http://localhost:3000/a/event-history', { headers: { Authorization: `Bearer ${token}` } });
                const formattedEvents = response.data.events.map(event => ({
                    ...event,
                    eventDate: new Date(event.eventDate),
                }));
                setEvents(formattedEvents);
                setFilteredEvents(formattedEvents); // Initialize filtered events
            } catch (error) {
                console.error('Error fetching events:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleSort = (selectedOption) => {
        if (selectedOption === 'all') {
            setFilteredEvents(events);
        } else if (selectedOption === 'upcoming') {
            const today = new Date();
            setFilteredEvents(
                events.filter(event => new Date(event.eventDate) >= today)
            );
        } else if (selectedOption === 'past') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            setFilteredEvents(
                events.filter(event => new Date(event.eventDate).setHours(0, 0, 0, 0) < today)
            );
        } else {
            setFilteredEvents(
                events.filter(event => event.participantGroup?.college === selectedOption)
            );
        }
        setCurrentPage(1); // Reset pagination
    };

    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    return (
        <div className="dashboard-container">
            <div className="history-content">
                <h2 className="dashboard-heading">Past Events</h2>
                
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search past events..."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setFilteredEvents(
                            events.filter(event =>
                                event.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
                                event.description.toLowerCase().includes(e.target.value.toLowerCase()) ||
                                event.location.toLowerCase().includes(e.target.value.toLowerCase())
                            )
                        );
                        setCurrentPage(1);
                    }}
                />

                {/* Sort Dropdown */}
                <div className="event-sort-container">
                    <select
                        className="event-sort"
                        value={sortOption}
                        onChange={(e) => {
                            const selectedOption = e.target.value;
                            setSortOption(selectedOption);
                            handleSort(selectedOption);
                        }}
                    >
                        <option value="all">All Events</option>
                        <option value="upcoming">Upcoming Events</option>
                        <option value="past">Past Events</option>
                        <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                        <option value="College of Business">College of Business</option>
                        <option value="College of Education">College of Education</option>
                        <option value="College of Law">College of Law</option>
                        <option value="College of Public Administration and Governance">College of Public Administration and Governance</option>
                        <option value="College of Nursing">College of Nursing</option>
                        <option value="College of Technologies">College of Technologies</option>
                    </select>
                </div>

                <div className="history-context-card">
                    <div className="history-events-list">
                        {loading ? (
                            <p>Loading events...</p>
                        ) : currentEvents.length > 0 ? (
                            <div className="history-events-grid">
                                {currentEvents.map(event => (
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
                                ))}
                            </div>
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
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
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
            </div>
        </div>
    );
};

export default HistoryM;
