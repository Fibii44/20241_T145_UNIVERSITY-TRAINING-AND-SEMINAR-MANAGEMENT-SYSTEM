import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './eventList.css';
function EventGrid() {
    const [events, setEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('dateAsc'); 
    const eventsPerPage = 4;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/u/events`);
                setEvents(response.data);
            } catch (err) {
                console.error("Failed to fetch events", err);
            }
        };

        fetchEvents();
    }, []);

    const handleSort = (option) => {
      setSortOption(option);
      const sortedEvents = [...events];
      if (option === 'dateAsc') {
        sortedEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      } else if (option === 'dateDesc') {
        sortedEvents.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      } else if (option === 'titleAsc') {
        sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
      } else if (option === 'titleDesc') {
        sortedEvents.sort((a, b) => b.title.localeCompare(a.title));
      }
      setEvents(sortedEvents);
    };
    // Calculate the indexes of the first and last event on the current page
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
    const totalPages = Math.ceil(events.length / eventsPerPage);
  
    const handlePageClick = (pageNumber) => {
      setCurrentPage(pageNumber);
    };
    // Handle page navigation
    const handleNextPage = () => {
        if (currentPage < Math.ceil(events.length / eventsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleSortChange = (event) => {
      setSortOption(event.target.value);
      setCurrentPage(1); // Reset to the first page on sort change
  }
    return (
        <div>
<div className="sort-container">
          <label className='sort-label' htmlFor="sort">Sort By:</label>
          <br />
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="dateAsc">Date (Ascending)</option>
            <option value="dateDesc">Date (Descending)</option>
            <option value="titleAsc">Title (A-Z)</option>
            <option value="titleDesc">Title (Z-A)</option>
          </select>
        </div>
            <div className="user-events-grid" style={{contentAlign: 'center', margin: '0 auto'}}>
                {currentEvents.map((event) => (
                    <Link to={`/u/events/${event._id}`} key={event._id} className="event-link">
                        <div className="user-event-card">
                          <div className='user-image'>
                          <img src={`http://localhost:3000/eventPictures/${event.eventPicture}`} alt={event.title} className="event-image" onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')} /> 
                          </div>
                            
                            <h3 style={{ color: '#011c39' }}>{event.title}</h3>
                            <p className='date'>
                                {new Date(event.eventDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </p>
                            <div className='event-description'>
                                <p>{event.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="pagination-controls mb-3" >
                
            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`page-number ${
                  currentPage === index + 1 ? "active" : ""
                }`}
                onClick={() => handlePageClick(index + 1)}
              >
                {index + 1}
              </button>
            ))}

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
        </div>
    );
}

export default EventGrid;