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
    const [filterOption, setFilterOption] = useState('all'); // New state for filtering
    const eventsPerPage = 4;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/u/events`);
                const today = new Date();
    
                // Filter upcoming events
                const upcomingEvents = response.data.filter(
                    (event) => new Date(event.eventDate) >= today
                );
    
                // Sort events by date (ascending)
                const sortedEvents = upcomingEvents.sort(
                    (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
                );
    
                setEvents(response.data); // Save all events
                setFilteredEvents(sortedEvents); // Initialize filtered events
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

    const handleFilter = (option) => {
        setFilterOption(option);
        if (option === 'all') {
            setFilteredEvents(events);
        } else {
            setFilteredEvents(
                events.filter((event) => event.participantGroup?.college === option)
            );
        }
        setCurrentPage(1);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const lowerQuery = query.toLowerCase();
        setFilteredEvents(
            events.filter((event) =>
                event.title.toLowerCase().includes(lowerQuery) ||
                event.description.toLowerCase().includes(lowerQuery)
            )
        );
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
                                    events.filter((event) => new Date(event.eventDate) >= today)
                                ); // Show upcoming events
                            } else if (selectedOption === 'past') {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
                                setFilteredEvents(
                                    events.filter((event) => new Date(event.eventDate).setHours(0, 0, 0, 0) < today)
                                );
                            }
                             else if (selectedOption === 'CAS') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Arts and Sciences')
                                ); // Show events for CAS
                            } else if (selectedOption === 'COB') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Business')
                                ); // Show events for COB
                            } else if (selectedOption === 'COE') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Education')
                                ); // Show events for COE
                            } else if (selectedOption === 'COL') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Law')
                                ); // Show events for COL
                            } else if (selectedOption === 'CPAG') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Public Administration and Governance')
                                ); // Show events for CPAG
                            } else if (selectedOption === 'CON') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Nursing')
                                ); // Show events for CON
                            } else if (selectedOption === 'COT') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Technologies')
                                ); // Show events for COT
                            } else {
                                handleSort(selectedOption); // Handle sorting for other options
                            }

                            setSortOption(selectedOption);
                            setCurrentPage(1); // Reset to first page
                        }}
                    >
                        {/* Filter Options */}
                        <optgroup label="Filters">
                            <option value="upcoming">Upcoming Events</option>
                            <option value="past">Past Events</option>
                            <option value="CAS">College of Arts and Sciences</option>
                            <option value="COB">College of Business</option>
                            <option value="COE">College of Education</option>
                            <option value="COL">College of Law</option>
                            <option value="CPAG">College of Public Administrative and Governance</option>
                            <option value="CON">College of Nursing</option>
                            <option value="COT">College of Technologies</option>
                        </optgroup>
                    </select>
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
                                    events.filter((event) => new Date(event.eventDate) >= today)
                                ); // Show upcoming events
                            } else if (selectedOption === 'past') {
                                const today = new Date();
                                setFilteredEvents(
                                    events.filter((event) => new Date(event.eventDate) < today)
                                ); // Show past events
                            } else if (selectedOption === 'CAS') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Arts and Sciences')
                                ); // Show events for CAS
                            } else if (selectedOption === 'COB') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Business')
                                ); // Show events for COB
                            } else if (selectedOption === 'COE') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Education')
                                ); // Show events for COE
                            } else if (selectedOption === 'COL') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Law')
                                ); // Show events for COL
                            } else if (selectedOption === 'CPAG') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Public Administration and Governance')
                                ); // Show events for CPAG
                            } else if (selectedOption === 'CON') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Nursing')
                                ); // Show events for CON
                            } else if (selectedOption === 'COT') {
                                setFilteredEvents(
                                    events.filter((event) => event.participantGroup?.college === 'College of Technologies')
                                ); // Show events for COT
                            } else {
                                handleSort(selectedOption); // Handle sorting for other options
                            }

                            setSortOption(selectedOption);
                            setCurrentPage(1); // Reset to first page
                        }}
                    >
                        {/* Filter Options */}       
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
                            <div
                                className="event-college-department"
                                style={{
                                    backgroundColor: event.participantGroup?.college ? event.color : '#9e1414',
                                }}
                            >
                                <p>{event.participantGroup?.college || 'Exclusive'}</p>
                            </div>
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
