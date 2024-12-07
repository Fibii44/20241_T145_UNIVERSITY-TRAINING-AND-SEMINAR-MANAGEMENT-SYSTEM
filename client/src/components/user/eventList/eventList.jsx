import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './eventList.css';

function EventGrid() {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('dateAsc');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOption, setFilterOption] = useState('all'); // New state for filtering
    const eventsPerPage = 4;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/u/events`);
                const today = new Date();
                const filtered = response.data.filter(
                    (event) => new Date(event.eventDate).setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0)
                );
                setEvents(filtered);
                setFilteredEvents(filtered); // Initialize filtered events
            } catch (err) {
                console.error("Failed to fetch events", err);
            }
        };
    
        fetchEvents();
    }, []);
    

    const handleSort = (option) => {
        setSortOption(option);
        const sortedEvents = [...filteredEvents];
        if (option === 'dateAsc') {
            sortedEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        } else if (option === 'dateDesc') {
            sortedEvents.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        } else if (option === 'titleAsc') {
            sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
        } else if (option === 'titleDesc') {
            sortedEvents.sort((a, b) => b.title.localeCompare(a.title));
        }
        setFilteredEvents(sortedEvents);
        setCurrentPage(1); // Reset to first page
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const lowerQuery = query.toLowerCase();
        const results = events.filter(
            (event) =>
                event.title.toLowerCase().includes(lowerQuery) ||
                event.description.toLowerCase().includes(lowerQuery)
        );
        setFilteredEvents(results);
        setCurrentPage(1); // Reset to first page
    };

    const handleFilter = (option) => {
        setFilterOption(option);
        const today = new Date();
        let filtered;
    
        if (option === 'all') {
            filtered = events;
        } else if (option === 'upcoming') {
            filtered = events.filter(
                (event) => new Date(event.eventDate).setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0)
            );
        } else if (option === 'past') {
            filtered = events.filter(
                (event) => new Date(event.eventDate).setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)
            );
        }
    
        setFilteredEvents(filtered);
        setCurrentPage(1); // Reset to first page
    };
    

    // Pagination
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div>
            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
               
                 {/* Sort Dropdown */}
        <div className="event-sort-container">
            
            <br />
            <select
                className="event-sort"
                id="sort"
                value={sortOption}
                onChange={(e) => {
                    const selectedOption = e.target.value;
                    if (selectedOption === 'all') {
                        setFilteredEvents(events); // Show all events
                    } else if (selectedOption === 'upcoming') {
                        const today = new Date();
                        setFilteredEvents(
                            events.filter(event => new Date(event.eventDate) >= today)
                        ); // Show upcoming events
                    } else if (selectedOption === 'past') {
                        const today = new Date();
                        setFilteredEvents(
                            events.filter(event => new Date(event.eventDate) < today)
                        ); // Show past events
                    } else {
                        handleSort(selectedOption); // Handle sorting
                    }
                    setSortOption(selectedOption);
                    setCurrentPage(1); // Reset to first page
                }}
            >
                {/* Filter Options */}
                <optgroup label="Filters">
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming Events</option>
                    <option value="past">Past Events</option>
                </optgroup>
                {/* Sort Options */}
                <optgroup label="Sort By">
                    <option value="dateAsc">Date (Ascending)</option>
                    <option value="dateDesc">Date (Descending)</option>
                    <option value="titleAsc">Title (A-Z)</option>
                    <option value="titleDesc">Title (Z-A)</option>
                </optgroup>
            </select>
        </div>
            </div>
            
           


            {/* Events Grid */}
            <div className="user-events-grid" style={{ contentAlign: 'center', margin: '0 auto' }}>
                {currentEvents.map((event) => (
                    <Link to={`/u/events/${event._id}`} key={event._id} className="event-link">
                        <div className="user-event-card">
                            <div className="user-image">
                                <img
                                    src={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                                    alt={event.title}
                                    className="event-image"
                                    onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')}
                                />
                            </div>
                            <h3 style={{ color: '#011c39' }}>{event.title}</h3>
                            <p className="date">
                                {new Date(event.eventDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                            <div className="event-description">
                                <p>{event.description}</p>
                            </div>
                            <div className="event-button">
                                <button>Find Out</button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls mb-3">
                <button
                    className="page-btn"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                    const pageNumber = startPage + i;
                    return (
                        <button
                            key={pageNumber}
                            className={`page-number ${currentPage === pageNumber ? "active" : ""}`}
                            onClick={() => handlePageClick(pageNumber)}>
                            {pageNumber}
                        </button>
                    );
                })}
                <button
                    className="page-btn"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
        </div>
    );
}

export default EventGrid;
