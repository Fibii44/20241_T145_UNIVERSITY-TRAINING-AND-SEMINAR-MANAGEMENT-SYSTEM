import React from 'react';
import { useParams } from 'react-router-dom';
import './events-grid.css';

// Sample data; this could be replaced with data fetched from an API
const events = [
    { id: 1, title: "Event 1", description: "Seminar", imgSrc: require('../../../assets/eventImg.jpg'), date: "2024-11-15", location: "Admin Building" },
    { id: 2, title: "Event 2", description: "Alumni", imgSrc: require('../../../assets/eventImg.jpg'), date: "2024-12-01", location: "Auditorium" },
    
];

function EventDetails() {
    const { id } = useParams(); // Get the event ID from the URL
    const event = events.find(event => event.id === parseInt(id)); // Find the event by ID

    if (!event) {
        return <p>Event not found.</p>;
    }

    return (
        <div className="event-details">
            <h2>{event.title}</h2>
            <img src={event.imgSrc} alt={event.title} className="event-image" />
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Description:</strong> {event.description}</p>
        </div>
    );
}

export default EventDetails;