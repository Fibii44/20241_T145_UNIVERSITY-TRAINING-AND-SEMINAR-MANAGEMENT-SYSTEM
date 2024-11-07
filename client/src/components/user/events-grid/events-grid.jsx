import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure axios is installed and imported
import './events-grid.css';
import { Link } from 'react-router-dom';

function EventGrid() {
    const [events, setEvents] = useState([]); // State to store the list of events
    const [loading, setLoading] = useState(true); // State to handle loading state
    const [error, setError] = useState(null); // State to handle errors

    useEffect(() => {
        // Function to fetch all events
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/a/events`);
                setEvents(response.data); // Assuming response data is an array of events
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch events");
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Show loading message while fetching data
    if (loading) return <p>Loading events...</p>;

    // Show error message if fetching data fails
    if (error) return <p>{error}</p>;

    return (
    <Link to={'/u/events/:id'}>
        <div className="events-grid">
            {events.map((event) => (
                <div key={event.id} className="event-card">
                    <h3>{event.title}</h3>
                    <img src={event.imgSrc || '../../../assets/adminProfile.png'} alt={event.title} className="event-image"  />
                    <p><strong>Date:</strong> {event.date}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p><strong>Description:</strong> {event.description}</p>
                </div>
            ))}
        </div>
    </Link>
    );
}

export default EventGrid;