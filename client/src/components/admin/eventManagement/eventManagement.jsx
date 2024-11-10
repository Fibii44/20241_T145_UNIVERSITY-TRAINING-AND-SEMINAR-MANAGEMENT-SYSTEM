// eventManagement.jsx
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/a/events');
      setEvents(response.data);
    } catch (error) {
      alert('Error fetching events: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
 
  const handleEdit = (event) => {
    setSelectedEvent(event);
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
    const formattedEventDate = date ? new Date(date).toISOString() : undefined;
  
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

    console.log(eventPicture)

    const formData = new FormData();
    formData.append('title', rest.title);
    formData.append('eventDate', formattedEventDate);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    formData.append('location', rest.location);
    formData.append('hostname', rest.hostname || '');
    formData.append('description', rest.description || '');
    formData.append('color', rest.color || '#65a8ff');
    if (eventPicture) {
      formData.append('eventPicture', eventPicture); // Add the event picture to the form data
    }
    if (participants) {
      formData.append('participantGroup[college]', participants.college || "All");
      formData.append('participantGroup[department]', participants.department || "All");
    }
    customParticipants.forEach((email, index) => formData.append(`customParticipants[${index}]`, email.trim()));

    // Only add createdBy for new events
    if (!selectedEvent) {
      formData.append('createdBy', userId);
    }

    // Always update editedBy if it's an edit
    if (selectedEvent) {
      formData.append('editedBy', userId);
    }

    try {
      if (selectedEvent) {
        const response = await axios.put(`http://localhost:3000/a/events/${selectedEvent._id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        alert('Event updated successfully');
        setEvents(events.map(event => (event._id === selectedEvent._id ? { ...event, ...response.data.event } : event)));
      } else {
        const response = await axios.post('http://localhost:3000/a/events', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        alert(response.data.message || 'Event created successfully');
        setEvents(prevEvents => [...prevEvents, response.data]);
      }
    } catch (error) {
      alert('Error saving event: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsModalOpen(false);
      setSelectedEvent(null); // Reset selected event after saving
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
            {events.map((event) => (
              <div className="admin-event-card" key={event._id || event.id}>
              <div className="event-image">
                <img
                  src={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                  alt={`${event.title} image`}
                  className="event-img"
                />
              </div>
              <div className="event-details">
                <div className="event-title">
                   <h3>{event.title}</h3>
                </div>
               
                <p className="event-description">{event.description}</p>
                <div className="event-info">
                  <span><FontAwesomeIcon icon={faCalendarCheck} /> {event.date}</span>
                  <span><FontAwesomeIcon icon={faClock} /> {event.startTime} - {event.endTime}</span>
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