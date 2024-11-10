import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './eventDetails.css'

function Event() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showImage, setShowImage] = useState(false); 

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };


    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/u/events/${id}`);
                setEvent(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch event");
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    if (loading) return <p>Loading event...</p>;
    if (error) return <p>{error}</p>;
    if (!event) return <p>Event not found.</p>;

    return (
        <div class="card" style={{ maxWidthwidth: '1000px' }}>
            <div class="container" className="eventDetail">
                <div class="user-event-details" key={event._id || event.id}>
                    <img 
                        src={`http://localhost:3000/eventPictures/${event.eventPicture}`} 
                        alt={event.title} 
                        class="event-image" 
                        onClick={() => setShowImage(true)} // Show overlay on click
                    />

                    {showImage && ( // Overlay div
                        <div className="event-image-overlay" onClick={() => setShowImage(false)}>
                            <img 
                                src={`http://localhost:3000/eventPictures/${event.eventPicture}`} 
                                alt={event.title} 
                                class="large-image" 
                            />
                        </div>
                    )}

                    <h3>{event.title}</h3>
                    <p className="event-date"><i class="fas fa-calendar-alt"></i> <strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    <p className="event-time"><i class="fas fa-clock"></i> <strong>Time:</strong> {formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                    <p className="event-location"><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> {event.location}</p>
                    <p className="event-description"><i class="fas fa-info-circle"></i> <strong>Description:</strong> {event.description}</p>
                    <div className="user-register-button" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <button className='register-button'>Register</button>
                    </div>
                </div> 
            </div>
        </div>
    );
}

export default Event;