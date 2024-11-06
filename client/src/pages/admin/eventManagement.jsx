// eventManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faClock, faPlus, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import './css/eventM.css';
import { jwtDecode } from 'jwt-decode';
import Sidebar from '../../components/admin/adminbar/sidebar';
import Topbar from '../../components/admin/adminbar/topbar';
import EventModal from '../../components/admin/admin_create-events/create-events';

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
    const { date, startTime, endTime, participants, customParticipants = [], ...rest } = eventDetails;
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
  
    const payload = {
      ...rest,
      eventDate: formattedEventDate,
      startTime,
      endTime,
      participantGroup: customParticipants.length > 0 ? null : {
        college: participants.college || "All",
        department: participants.department || "All"
      },
      customParticipants: customParticipants.map(email => email.trim()).filter(email => email.includes('@')),
    };
  
    // Only add `createdBy` for new events
    if (!selectedEvent) {
      payload.createdBy = userId;
    }
  
    // Always update `editedBy` if it's an edit
    if (selectedEvent) {
      payload.editedBy = userId;
    }
  
    try {
      if (selectedEvent) {
        const response = await axios.put(`http://localhost:3000/a/events/${selectedEvent._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Event updated successfully');
        setEvents(events.map(event => (event._id === selectedEvent._id ? { ...event, ...response.data.event } : event)));
      } else {
        const response = await axios.post('http://localhost:3000/a/events', payload, {
          headers: { Authorization: `Bearer ${token}` }
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
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="events" />
      <div className="content">
        <Topbar />
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
          <div className="events-list">
            {events.map((event) => (
              <div className="event-card" key={event._id || event.id}>
                <div className="event-details">
                  <h3 className="event-title">{event.title}</h3>
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
