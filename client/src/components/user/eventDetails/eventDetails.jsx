import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '@fontsource/nunito-sans'; 
import { useParams } from 'react-router-dom';
import './eventDetails.css'

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
        <div class="card"  style={{ maxWidthwidth: '1000px' }}>
        <div class="container"  className="eventDetail">
            
                <div class="user-event-details" key={event._id || event.id}>
                <img src={`http://localhost:3000/eventPictures/${event.eventPicture}`} alt={event.title} class="event-image" />
                <h3>{event.title}</h3>
                <p className="event-date"><i class="fas fa-calendar-alt"></i> <strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}</p>
                <p className="event-time"><i class="fas fa-clock"></i> <strong>Time:</strong> {event.startTime} - {event.endTime}</p>
                <p className="event-location"><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> {event.location}</p>
                <p className="event-description"><i class="fas fa-info-circle"></i> <strong>Description:</strong> {event.description}</p>
                <div className="user-register-button" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',}}>
                <button className='register-button'>Register</button>
                </div>
                </div> 
                
        </div>
        </div>
    );
}

export default Event;