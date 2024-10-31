import React, { useState } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './events-grid.css';

function Events() {
    // Sample data for demonstration
    const events = [
        { id: 1, title: "Event 1", imgSrc: "https://via.placeholder.com/150" },
        { id: 2, title: "Event 2", imgSrc: "https://via.placeholder.com/150" },
        { id: 3, title: "Event 3", imgSrc: "https://via.placeholder.com/150" },
        { id: 4, title: "Event 4", imgSrc: "https://via.placeholder.com/150" },
        { id: 5, title: "Event 5", imgSrc: "https://via.placeholder.com/150" },
        { id: 6, title: "Event 6", imgSrc: "https://via.placeholder.com/150" },
        { id: 7, title: "Event 7", imgSrc: "https://via.placeholder.com/150" },
        { id: 8, title: "Event 8", imgSrc: "https://via.placeholder.com/150" },
        { id: 9, title: "Event 9", imgSrc: "https://via.placeholder.com/150" },
        { id: 10, title: "Event 10", imgSrc: "https://via.placeholder.com/150" }
    ];

    return (
        <div className="events-grid">
            {events.map(event => (
                <div key={event.id} className="event-item">
                    <img src={event.imgSrc} alt={event.title} />
                    <p>{event.title}</p>
                </div>
            ))}
        </div>
    );
}

export default Events;