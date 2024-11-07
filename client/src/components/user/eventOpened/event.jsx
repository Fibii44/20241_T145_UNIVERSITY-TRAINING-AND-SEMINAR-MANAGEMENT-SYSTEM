import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './event.css'
function Event() {
    const { id } = useParams(); // Get the event ID from the URL
    const [event, setEvent] = useState(null); // State to store a single event
    const [loading, setLoading] = useState(true); // State to handle loading state
    const [error, setError] = useState(null); // State to handle errors

    useEffect(() => {
        // Function to fetch a single event by ID
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/u/events/${id}`);
                setEvent(response.data); // Assuming response.data is the event object
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch event");
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]); // Dependency on id to refetch if it changes

    // Show loading message while fetching data
    if (loading) return <p>Loading event...</p>;

    // Show error message if fetching data fails
    if (error) return <p>{error}</p>;

    // Show message if no event is found
    if (!event) return <p>Event not found.</p>;

    return (
        <div className="event-details">
            <h3>{event.title}</h3>
            {/* <img src={event.imgSrc || '../../../assets/adminProfile.png'} alt={event.title} className="event-image" /> */}
            <p><strong>Date:</strong> {event.eventDate}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Description:</strong> {event.description}</p>
        </div>
    );
}

export default Event;