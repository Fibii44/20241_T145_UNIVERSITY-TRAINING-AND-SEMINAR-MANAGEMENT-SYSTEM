import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faClock, faPlus, faMapMarkerAlt, faLock, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './eventManagement.css';
import EventModal from '../createEvents/createEvents';
import DeleteModal from '../../modals/deleteModal/deleteModal';

const EventM = ({ userRole, userCollege }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;

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

      // Update event list and ensure isLocked status is correct
      setEvents(prevEvents => {
        return formattedEvents.map(newEvent => {
          // Find if the event already exists and should be updated with new lock status
          const prevEvent = prevEvents.find(event => event._id === newEvent._id);
          return prevEvent
            ? { ...prevEvent, isLocked: newEvent.isLocked }
            : newEvent;
        });
      });
    } catch (error) {
      alert('Error fetching events: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const nextPage = () => {
    if (currentPage < Math.ceil(events.length / eventsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  //When edit button was clicked
  const handleEdit = async (event) => {
    const token = sessionStorage.getItem('authToken');

    if (!token) {
      alert('User is not authenticated. Please log in.');
      return;
    }

    const formattedSelectedEvent = event ? {
      ...event,
      eventDate: (event.eventDate instanceof Date ? event.eventDate : new Date(event.eventDate)).toISOString().split("T")[0], // format as YYYY-MM-DD
      startTime: (event.startTime instanceof Date ? event.startTime : new Date(event.startTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: (event.endTime instanceof Date ? event.endTime : new Date(event.endTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    } : null;

    setSelectedEvent(formattedSelectedEvent);
    setIsModalOpen(true);

    // Lock the event for editing by this user
    try {
      await axios.put(`http://localhost:3000/a/events/${event._id}/lock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Event is successfully locked, proceed with editing
    } catch (error) {
      alert('Failed to lock event for editing: ' + error.message);
      // If locking fails, revert the lock status in the UI
      setEvents(prevEvents => prevEvents.map(ev =>
        ev._id === event._id ? { ...ev, isLocked: false } : ev
      ));
    }
  };

  const handleDelete = (eventId) => {
    setEventToDelete(eventId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const token = sessionStorage.getItem('authToken');
    try {
      await axios.delete(`http://localhost:3000/a/events/${eventToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(events.filter(event => event._id !== eventToDelete));
      setEventToDelete(null);
      setIsDeleteModalOpen(false); // Close modal after deletion
    } catch (error) {
      console.error('Error deleting event:', error.message);
    }
  };

  //Unlock the event when user click cancel button
  const handleCancelEdit = async () => {
    // If editing an event, unlock it
    if (selectedEvent) {
      const token = sessionStorage.getItem('authToken');
      try {
        await axios.put(`http://localhost:3000/a/events/${selectedEvent._id}/unlock`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        alert('Error unlocking event: ' + error.message);
      }
    }
    setIsModalOpen(false);
    setSelectedEvent(null); // Reset selected event
  };

  const handleSaveEventDetails = async (eventDetails) => {
    const { date, startTime, endTime, participants, customParticipants = [], eventPicture, reminders, ...rest } = eventDetails;


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
    formData.append('description', rest.description || '');
    formData.append('color', rest.color || '#65a8ff');
    if (eventPicture) formData.append('eventPicture', eventPicture);
    if (!customParticipants.length) {
      if (participants) {
      formData.append('participantGroup[college]', participants.college || "All");
      formData.append('participantGroup[department]', participants.department || "All");
      }
    }

    if(customParticipants.length > 0) {
      customParticipants.forEach((email, index) => formData.append(`customParticipants[${index}]`, email.trim()));
    }
    
    if (reminders && reminders.length > 0) {
      reminders.forEach((reminder, index) => {
        formData.append(`reminders[${index}][method]`, reminder.method);
        formData.append(`reminders[${index}][minutesBefore]`, reminder.minutesBefore);
      });
    }


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
      // Release lock after save
      try {
        // Unlock the event
        await axios.put(`http://localhost:3000/a/events/${selectedEvent._id}/unlock`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

      } catch (error) {
        alert('Error unlocking event: ' + error.message);
      } finally {
        // Close modal and reset selected event
        setIsModalOpen(false);
        setSelectedEvent(null);
        
      }
    }
  };

  useEffect(() => {
    fetchEvents();

    // Setup SSE
    const eventSource = new EventSource('http://localhost:3000/a/events/stream');

    // Listen for messages from the server
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Update the lock status of the specific event
      setEvents(prevEvents => prevEvents.map(ev =>
        ev._id === data.eventId ? { ...ev, isLocked: data.isLocked } : ev
      ));
    };

    // Cleanup when component unmounts
    return () => {

      eventSource.close();
    };
  }, []);

  return (
    <div className="dashboard-container">
      <div className="content">
        <div className="dashboard-inline">
          <h2 className="dashboard-heading">Events</h2>
          <button className="dashboard-button" onClick={() => {
            setSelectedEvent(null); // Clear previous event data
            setIsModalOpen(true);
          }} disabled={loading}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <EventModal
          isOpen={isModalOpen}
          onClose={handleCancelEdit}
          onSave={handleSaveEventDetails}
          userRole={userRole}
          userCollege={userCollege}
          initialEventData={selectedEvent}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={confirmDelete}
        />

        <div className="context-card">
          <div className="admin-event-list">
            {currentEvents.map((event, index) => (
              <div className="event-card" key={`${event._id}-${event.startTime.getTime()}`}>
                <div className="event-image">
                  <img
                    src={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                    alt={`${event.title || "No"} image`}
                    className="event-img"
                    onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')}
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
                  {event.isLocked ? (
                    <FontAwesomeIcon icon={faLock} className="lock-icon" title="Event is being edited by another admin" />
                  ) : (
                    <>
                      <button onClick={() => handleEdit(event)}>Edit</button>
                      <button onClick={() => handleDelete(event._id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`page-number ${
                  currentPage === index + 1 ? "active" : ""
                }`}
                onClick={() => handlePageClick(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventM;