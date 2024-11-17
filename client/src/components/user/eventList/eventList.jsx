import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './eventList.css';
function EventGrid() {
    const [events, setEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
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

    return (
        <div>
            <div className="events-grid" style={{contentAlign: 'center', margin: '0 auto'}}>
                {currentEvents.map((event) => (
                    <Link to={`/u/events/${event._id}`} key={event._id} className="event-link">
                        <div className="event-card">
                            <img src={`http://localhost:3000/eventPictures/${event.eventPicture}`} alt={event.title} className="event-image" onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')} /> 
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