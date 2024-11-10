import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './eventList.css';
import EventImage from '../../../assets/adminProfile.png';

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
            <div className="events-grid">
                {currentEvents.map((event) => (
                    <Link to={`/u/events/${event._id}`} key={event._id} className="event-link">
                        <div className="event-card">
                            <img src={`http://localhost:3000/eventPictures/${event.eventPicture}`} alt={event.title} className="event-image" /> 
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
                            <button>Register</button>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="pagination-controls">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>❮ Prev</button>
                <button onClick={handleNextPage} disabled={currentPage === Math.ceil(events.length / eventsPerPage)}>Next ❯</button>
            </div>
        </div>
    );
}

export default EventGrid;