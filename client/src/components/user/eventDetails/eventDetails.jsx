import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './eventDetails.css'

function Event() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showImage, setShowImage] = useState(false); 
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState("Register");
    const [googleEventId, setGoogleEventId] = useState(null); // Store Google Calendar event ID
    const [isLoading, setIsLoading] = useState(false); // Declare setIsLoading
    const [currentUser, setCurrentUser] = useState(null);
    const [canRegister, setCanRegister] = useState(false);
    const [ isEventActive, setIsEventActive] = useState(false);

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const checkEventTime = () => {
        if(!event) { return false; }
        const currentTime = new Date();
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);

        return currentTime < eventStart
    }

    useEffect(() => {
        if(event) {
            setIsEventActive(checkEventTime());
        }
    }, [event]);

    useEffect(() => {
        const checkUser = async () => {
            const token = sessionStorage.getItem('authToken');
            if(!token) { return false; }

            try {
                const decodedToken = jwtDecode(token);
                setCurrentUser(decodedToken);

                const hasCustomParticipants = event?.customParticipants?.length > 0;
                
                if(hasCustomParticipants) {
                    setCanRegister(event.customParticipants.includes(decodedToken.email));
                    return;
                }

                const isOpenToAll = !event?.participantGroup?.college || event.participantGroup.college === " " || event.participantGroup.college === "All";

                const isPartOfCollege = isOpenToAll || event?.participantGroup?.college === decodedToken.department;

                setCanRegister(isOpenToAll || isPartOfCollege );
            }catch(error) {
                console.error("Error checking user access", error);
                setCanRegister(false);
            }

        };
        if(event) { checkUser(); }
    }, [event]);

    useEffect(() => {

        const checkRegistration = async () => {
            const token = sessionStorage.getItem('authToken');
            console.log(token);
            if (!token) {
                setError("No token found, please log in.");
                return;
            }
        
            try {
                console.log(`Checking registration status ${id}`);
                const response = await axios.get(`http://localhost:3000/u/events/${id}/check-registration`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsRegistered(response.data.isRegistered);
                setRegistrationStatus(response.data.isRegistered ? "Cancel Registration" : "Register");
                setGoogleEventId(response.data.googleEventId || null); // Store googleEventId from response
            } catch (err) {
                console.error("Error checking registration status", err);
                setError("Failed to check registration status");
            }
        };
        
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
        checkRegistration();
    }, [id]);


    const handleRegistration = async () => {
        const token = sessionStorage.getItem('authToken');
        try {
            const response = await axios.post('http://localhost:3000/u/events/', { eventId: id }, { headers: { Authorization: `Bearer ${token}` } });
            setIsRegistered(true); // User is now registered
            setRegistrationStatus("Cancel Registration"); // Change the button text to "Cancel Registration"
            alert('Event added to your Google Calendar with reminders');
        } catch (err) {
            alert('Failed to register for the event');
        }
    };

    const handleCancellation = async () => {
        const token = sessionStorage.getItem('authToken');
        
        try {
            if (!googleEventId) {
                alert('No Google Calendar event found to cancel.');
                return;
            }
            // Send delete request with the googleEventId
            await axios.delete(
                `http://localhost:3000/u/events/${id}/cancellation`,
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    data: { 
                        googleEventId: googleEventId 
                    }
                }
            );
            
            setIsRegistered(false);
            setRegistrationStatus("Register");
            alert('Registration and calendar event cancelled successfully');
        } catch (error) {
            console.error('Cancellation error:', error);
            alert('Failed to cancel registration: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return <p>Loading event...</p>;
    if (error) return <p>{error}</p>;
    if (!event) return <p>Event not found.</p>;

    return (
        <div className="card" style={{ maxWidthwidth: '1000px'}}>
            <div className="container eventDetail">
                <div className="user-event-details" key={event._id || event.id} style={{contentAlign: 'center', margin: '0 auto'}}>
                    <img 
                        src={`http://localhost:3000/eventPictures/${event.eventPicture}`} 
                        alt={event.title} 
                        className="event-image" 
                        onClick={() => setShowImage(true)} // Show overlay on click
                    />

                    {showImage && ( // Overlay div
                        <div className="event-image-overlay" onClick={() => setShowImage(false)}>
                            <img 
                                src={`http://localhost:3000/eventPictures/${event.eventPicture}`} 
                                alt={event.title} 
                                className="large-image" 
                            />
                        </div>
                    )}

                    <h3><strong>{event.title}</strong></h3>
                    <h6 className="event-date"><i className="fas fa-calendar-alt"></i> <strong>Date:</strong> <strong>{new Date(event.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong></h6>
                    <h6 className="event-time"><i className="fas fa-clock"></i> <strong>Time:</strong> <strong>{formatTime(event.startTime)} - {formatTime(event.endTime)}</strong></h6>
                    <h6 className="event-location"><i className="fas fa-map-marker-alt"></i> <strong>Location:</strong> <strong>{event.location}</strong></h6>
                    <h6 className="event-description"><i className="fas fa-info-circle"></i> <strong>Description:</strong> {event.description}</h6>
                    <div className="user-register-button" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        {canRegister ? (
                            isEventActive ? (
                                <button className='register-button' onClick={isRegistered ? handleCancellation : handleRegistration}>
                                    {registrationStatus}
                                </button>
                            ) : (
                                <p>Event has already started or ended.</p>
                            )   
                        ) : (
                            <p>You are not part of this event.</p>
                        )}
                    </div>
                </div> 
            </div>
        </div>
    );
}

export default Event;