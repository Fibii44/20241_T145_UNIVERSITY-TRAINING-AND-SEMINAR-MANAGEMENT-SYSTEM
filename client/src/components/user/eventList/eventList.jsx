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
    const [sortOption, setSortOption] = useState('upcoming'); // Default to upcoming events
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOption, setFilterOption] = useState('all'); // College filter
    const eventsPerPage = 4;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/u/events`);
                setEvents(response.data);
                // Apply initial filter for upcoming and ongoing events
                const now = new Date();
                const upcomingAndOngoingEvents = response.data.filter(
                    (event) => {
                        const eventStartTime = new Date(event.startTime);
                        const eventEndTime = new Date(event.endTime);
                        return eventStartTime > now || (now >= eventStartTime && now <= eventEndTime);
                    }
                );
                setFilteredEvents(upcomingAndOngoingEvents);
            } catch (err) {
                console.error("Failed to fetch events", err);
            }
        };
        fetchEvents();
    }, []);

    // Combined filter function that handles both time and college filters
    const applyFilters = (timeFilter, collegeFilter, searchTerm = '') => {
        const now = new Date();
        let filtered = [...events];

        console.log('Applying filters:', {
            timeFilter,
            collegeFilter,
            searchTerm,
            totalEvents: events.length
        });

        // First apply time filter
        if (timeFilter === 'upcoming') {
            filtered = filtered.filter(event => {
                const eventStartTime = new Date(event.startTime);
                return eventStartTime > now;
            });
        } else if (timeFilter === 'past') {
            filtered = filtered.filter(event => {
                const eventEndTime = new Date(event.endTime);
                return eventEndTime < now;
            });
        } else if (timeFilter === 'ongoing') {
            filtered = filtered.filter(event => {
                const eventStartTime = new Date(event.startTime);
                const eventEndTime = new Date(event.endTime);
                return now >= eventStartTime && now <= eventEndTime;
            });
        }

        console.log('After time filter:', {
            timeFilter,
            remainingEvents: filtered.length,
            sampleEvent: filtered[0]
        });

        // Then apply college filter
        if (collegeFilter !== 'all') {
            filtered = filtered.filter(event => {
                console.log('Event college:', {
                    eventCollege: event.participantGroup?.college,
                    filterCollege: collegeFilter,
                    matches: event.participantGroup?.college === collegeFilter
                });
                return event.participantGroup?.college === collegeFilter;
            });
        }

        console.log('After college filter:', {
            collegeFilter,
            remainingEvents: filtered.length
        });

        // Finally apply search filter if there's a search term
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = applyFilters(sortOption, filterOption, query);
        setFilteredEvents(filtered);
        setCurrentPage(1);
    };

    const handleFilter = (option) => {
        setFilterOption(option);
        const filtered = applyFilters(sortOption, option, searchQuery);
        setFilteredEvents(filtered);
        setCurrentPage(1);
    };

    const handleSort = (option) => {
        setSortOption(option);
        const sortedEvents = [...filteredEvents];

        if (option === 'dateAsc') {
            sortedEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        } else if (option === 'dateDesc') {
            sortedEvents.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        } else if (option === 'collegeAsc') {
            sortedEvents.sort((a, b) => {
                const collegeA = a.participantGroup?.college || '';
                const collegeB = b.participantGroup?.college || '';
                return collegeA.localeCompare(collegeB);
            });
        } else if (option === 'collegeDesc') {
            sortedEvents.sort((a, b) => {
                const collegeA = a.participantGroup?.college || '';
                const collegeB = b.participantGroup?.college || '';
                return collegeB.localeCompare(collegeA);
            });
        }

        setFilteredEvents(sortedEvents);
        setCurrentPage(1);
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
        <div className='user-events-content'>
            <div className="search-filter-container">
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input"
                />

                <div className="filter-controls">
                    <div className="sort-group">
                        <label>Sort by:</label>
                        <select
                            className="custom-select"
                            value={sortOption}
                            onChange={(e) => {
                                const selectedOption = e.target.value;
                                setSortOption(selectedOption);
                                const filtered = applyFilters(selectedOption, filterOption, searchQuery);
                                setFilteredEvents(filtered);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="upcoming">Upcoming Events</option>
                            <option value="ongoing">Ongoing Events</option>
                            <option value="past">Past Events</option>
                            <option value="dateAsc">Date (Ascending)</option>
                            <option value="dateDesc">Date (Descending)</option>
                            <option value="titleAsc">Title (A-Z)</option>
                            <option value="titleDesc">Title (Z-A)</option>
                        </select>

                        <select
                            className="custom-select"
                            value={filterOption}
                            onChange={(e) => handleFilter(e.target.value)}
                        >
                            <option value="all">All Colleges</option>
                            <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                            <option value="College of Business">College of Business</option>
                            <option value="College of Education">College of Education</option>
                            <option value="College of Law">College of Law</option>
                            <option value="College of Public Administration and Governance">College of Public Administration and Governance</option>
                            <option value="College of Nursing">College of Nursing</option>
                            <option value="College of Technologies">College of Technologies</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="user-events-grid">
                {currentEvents.map((event) => (
                    <Link to={`/u/events/${event._id}`} key={event._id} className="event-link" style={{ textDecoration: 'none' }}>
                        <div className="user-event-card">
                            <div className="user-image">
                                <img
                                    src={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                                    alt={event.title}
                                    className="event-image"
                                    onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')}
                                />
                                <div
                                    className="event-college-department"
                                    style={{
                                        backgroundColor: event.participantGroup?.college ? event.color : '#9e1414',
                                    }}
                                >
                                    <p>{event.participantGroup?.college || 'Exclusive'}</p>
                                </div>
                            </div>
                            <h3>{event.title}</h3>
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
