import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faClock, faMapMarkerAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './history.css'; 
import { Link } from 'react-router-dom';
import Toast from '../../modals/successToast/toast'
const HistoryM = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('all');
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 4;
    const maxPageNumbers = 5; // Number of page numbers to display at a time
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
      };
      
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                setLoading(true);
                const response = await axios.get('http://localhost:3000/a/event-history', { headers: { Authorization: `Bearer ${token}` } });
                console.log('My data',response)
                // Ensure compatibility with the backend response
                const formattedEvents = response.data.events.map(event => ({
                    ...event,
                    eventDate: new Date(event.eventDate), // Format event date
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

    // Calculate pagination range
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPageNumbers / 2), totalPages - maxPageNumbers + 1));
    const endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

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
                        <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                        <option value="College of Business">College of Business</option>
                        <option value="College of Education">College of Education</option>
                        <option value="College of Law">College of Law</option>
                        <option value="College of Public Administration and Governance">College of Public Administration and Governance</option>
                        <option value="College of Nursing">College of Nursing</option>
                        <option value="College of Technologies">College of Technologies</option>
                        <option value="College of Technologies">Others</option>
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
                            {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
                                const pageNumber = startPage + index;
                                return (
                                    <button
                                        key={pageNumber}
                                        className={`page-button ${currentPage === pageNumber ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
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
