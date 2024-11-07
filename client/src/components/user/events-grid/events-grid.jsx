import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './events-grid.css';

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
                        <h3>{event.title}</h3>
                        <img src={event.imgSrc || '../../../assets/adminProfile.png'} alt={event.title} className="event-image" />
                        <p><strong>Date:</strong> {event.eventDate}</p>
                        <p><strong>Location:</strong> {event.location}</p>
                        <p><strong>Description:</strong> {event.description}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default EventGrid;
