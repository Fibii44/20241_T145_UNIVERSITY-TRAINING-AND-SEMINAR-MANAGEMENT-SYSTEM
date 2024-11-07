import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './events-grid.css';
import EventImage from  '../../../assets/adminProfile.png'

function EventGrid() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/u/events`);
                setEvents(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch events");
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <p>Loading events...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="events-grid">
            {events.map((event) => (
                <Link to={`/u/events/${event._id}`} key={event._id} className="event-link">
                    <div className="event-card">
                        <img src={EventImage} alt={event.title} className="event-image" />
                        <h3 style={{ color:'#011c39' }}>{event.title}</h3>
                        <p className='date'> {new Date(event.eventDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        })}</p>
                        <div className='event-description'>
                            <p> {event.description}</p>
                        </div>
                        <button>
                            Register
                        </button>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default EventGrid;
