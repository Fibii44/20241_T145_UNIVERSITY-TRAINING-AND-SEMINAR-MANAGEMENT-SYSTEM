import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faClock, faPlus, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import './eventManagement.css';
import { jwtDecode } from 'jwt-decode';
import EventModal from '../createEvents/createEvents';

const EventM = ({ userRole, userCollege }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Function to format time for display in 12-hour format
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/a/events');
      // Convert `startTime` and `endTime` to Date objects in state
      const formattedEvents = response.data.map(event => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      alert('Error fetching events: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    const formattedSelectedEvent = event ? {
        ...event,
        eventDate: (event.eventDate instanceof Date ? event.eventDate : new Date(event.eventDate)).toISOString().split("T")[0], // format as YYYY-MM-DD
        startTime: (event.startTime instanceof Date ? event.startTime : new Date(event.startTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: (event.endTime instanceof Date ? event.endTime : new Date(event.endTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    } : null;

    setSelectedEvent(formattedSelectedEvent);
    setIsModalOpen(true);
};



const handleDelete = async (eventId) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this event?');
  if (!confirmDelete) return;

  const token = sessionStorage.getItem('authToken');
  try {
    await axios.delete(`http://localhost:3000/a/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Event deleted successfully');
    setEvents(events.filter(event => event._id !== eventId));
  } catch (error) {
    console.error('Error deleting event:', error.message);
  }
};



  const handleSaveEventDetails = async (eventDetails) => {
    const { date, startTime, endTime, participants, customParticipants = [], eventPicture, ...rest } = eventDetails;

   

    // Ensure the date, startTime, and endTime are valid Date objects before calling toISOString
    const formattedEventDate = date && !isNaN(new Date(date).getTime()) ? new Date(date).toISOString() : undefined;
    const formattedStartTime = startTime && !isNaN(new Date(startTime).getTime()) ? new Date(startTime).toISOString() : undefined;
    const formattedEndTime = endTime && !isNaN(new Date(endTime).getTime()) ? new Date(endTime).toISOString() : undefined;

    // If any date is invalid, alert the user and return early
    if (!formattedEventDate || !formattedStartTime || !formattedEndTime) {
        alert('Invalid date or time values. Please check the inputs.');
        return;
    }

    const token = sessionStorage.getItem('authToken');
    if (!token) {
        alert('User is not authenticated. Please log in.');
        return;
    }

    let userId;
    try {
        const decodedToken = jwtDecode(token);
        userId = decodedToken.id;
    } catch (error) {
        alert('Invalid or expired token. Please log in again.');
        return;
    }

    const formData = new FormData();
    formData.append('title', rest.title);
    formData.append('eventDate', formattedEventDate);
    formData.append('startTime', formattedStartTime);
    formData.append('endTime', formattedEndTime);
    formData.append('location', rest.location);
    formData.append('hostname', rest.hostname || '');
    formData.append('description', rest.description || '');
    formData.append('color', rest.color || '#65a8ff');
    if (eventPicture) formData.append('eventPicture', eventPicture);
    if (participants) {
        formData.append('participantGroup[college]', participants.college || "All");
        formData.append('participantGroup[department]', participants.department || "All");
    }
    customParticipants.forEach((email, index) => formData.append(`customParticipants[${index}]`, email.trim()));

    if (!selectedEvent) {
        formData.append('createdBy', userId);
    } else {
        formData.append('editedBy', userId);
    }

    try {
        let response;
        if (selectedEvent) {
            response = await axios.put(`http://localhost:3000/a/events/${selectedEvent._id}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert('Event updated successfully');
        } else {
            response = await axios.post('http://localhost:3000/a/events', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert(response.data.message || 'Event created successfully');
        }

        const updatedEvent = {
          ...response.data,
          startTime: new Date(response.data.startTime),
          endTime: new Date(response.data.endTime),
          eventDate: new Date(response.data.eventDate), // Add this if `eventDate` is also needed
        };
        setEvents(prevEvents => prevEvents.map(event => (event._id === selectedEvent?._id ? updatedEvent : event)));
        await fetchEvents(); // Force re-fetching of events to ensure data consistency
    } catch (error) {
        alert('Error saving event: ' + (error.response?.data?.message || error.message));
    } finally {
        setIsModalOpen(false);
        setSelectedEvent(null);
    }
};

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="content">
        <div className="dashboard-inline">
          <h2 className="dashboard-heading">Events</h2>
          <button className="dashboard-button" onClick={() => setIsModalOpen(true)} disabled={loading}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEventDetails}
          userRole={userRole}
          userCollege={userCollege}
          initialEventData={selectedEvent}
        />

        <div className="context-card">
          <div className="admin-event-list">
            {events.map((event, index) => (
              <div className="event-card" key={`${event._id}-${event.startTime.getTime()}`}>
                <div className="event-image">
                  <img
                    src={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                    alt={`${event.title || "No"} image`}
                    className="event-img"
                    onError={(e) => (e.target.src = '/path/to/default-image.png')}
                  />
                </div>
                <div className="event-details">
                  <div className="event-title">
                    <h3>{event.title}</h3>
                  </div>
                  <p className="event-description">{event.description}</p>
                  <div className="event-info">
                    <span><FontAwesomeIcon icon={faCalendarCheck} /> {new Date(event.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    <span><FontAwesomeIcon icon={faClock} /> {formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                    <span><FontAwesomeIcon icon={faMapMarkerAlt} /> {event.location}</span>
                  </div>
                </div>
                <div className="event-actions">
                  <button className="btn-edit edit-button" onClick={() => handleEdit(event)}>Edit</button>
                  <button className="btn-delete delete-button" onClick={() => handleDelete(event._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventM;