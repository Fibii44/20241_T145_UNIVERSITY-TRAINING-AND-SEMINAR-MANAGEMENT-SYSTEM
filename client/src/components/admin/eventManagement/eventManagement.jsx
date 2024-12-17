import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faClock, faPlus, faMapMarkerAlt, faLock, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './eventManagement.css';
import { jwtDecode } from 'jwt-decode';
import EventModal from '../createEvents/createEvents';
import DeleteModal from '../../modals/deleteModal/deleteModal';
import Toast from '../../modals/successToast/toast'

const EventM = ({ userRole, userCollege }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [sortOption, setSortOption] = useState('dateAsc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 4;
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  
  // Function to format time for display in 12-hour format
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const fetchEvents = async () => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      setLoading(true);
      const response = await axios.get('http://localhost:3000/a/active-events', { headers: { Authorization: `Bearer ${token}` } });
  
      const formattedEvents = response.data.map(event => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      }));
  
      setEvents(formattedEvents);
    } catch (error) {
      if (error.response) {
        showToast(
          `Error: ${error.response.status} - ${
            error.response.data?.message || "Failed to fetch events from the server."
          }`,
          'error' // Pass 'error' for red color
        );
      } else if (error.request) {
        showToast(
          "Error: Unable to fetch events. Please check your network connection or try again later.",
          'error'
        );
      } else {
        showToast(`Error: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };
  const filteredEvents = events
  ?.filter(
    (event) =>
      (event.title?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '') ||
      (event.description?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '') ||
      (event.location?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '')
  )
  .filter((event) => event.status === 'active') || [];

  
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const maxVisibleButtons = 5;
  const visiblePagesStart = Math.max(currentPage - Math.floor(maxVisibleButtons / 2), 1);
  const visiblePagesEnd = Math.min(visiblePagesStart + maxVisibleButtons - 1, totalPages);
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

  

  const handleEdit = async (event) => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    if (!token) {
      showToast('User is not authenticated. Please log in.', 'error');
      return;
    }

    const formattedSelectedEvent = event ? {
      ...event,
      eventDate: (event.eventDate instanceof Date ? event.eventDate : new Date(event.eventDate)).toISOString().split("T")[0],
      startTime: (event.startTime instanceof Date ? event.startTime : new Date(event.startTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: (event.endTime instanceof Date ? event.endTime : new Date(event.endTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    } : null;

    setSelectedEvent(formattedSelectedEvent);
    setIsModalOpen(true);

    try {
      await axios.put(`http://localhost:3000/a/events/${event._id}/lock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      sessionStorage.setItem('lockedEventId', event._id); // Store lock status in session
    } catch (error) {
      showToast('Failed to lock event for editing: ' + error.message, 'error');
    }
  };


  const handleDelete = (eventId) => {
    setEventToDelete(eventId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
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

  const handleCancelEdit = async () => {
    // Unlock event if it was locked for editing
    if (selectedEvent) {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      try {
        await axios.put(`http://localhost:3000/a/events/${selectedEvent._id}/unlock`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        sessionStorage.removeItem('lockedEventId'); // Remove lock status from session
      } catch (error) {
        console.error('Failed to unlock event:', error);
      }
    }
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveEventDetails = async (eventDetails) => {
    const { date, startTime, endTime, participants, customParticipants = [], eventPicture, reminders, formLink, formId, ...rest } = eventDetails;


    // Ensure the date, startTime, and endTime are valid Date objects before calling toISOString
    const formattedEventDate = date && !isNaN(new Date(date).getTime()) ? new Date(date).toISOString() : undefined;
    const formattedStartTime = startTime && !isNaN(new Date(startTime).getTime()) ? new Date(startTime).toISOString() : undefined;
    const formattedEndTime = endTime && !isNaN(new Date(endTime).getTime()) ? new Date(endTime).toISOString() : undefined;

    // If any date is invalid, alert the user and return early
    if (!formattedEventDate || !formattedStartTime || !formattedEndTime) {
      showToast('Invalid date or time values. Please check the inputs.', 'error');
      return;
    }

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      showToast('User is not authenticated. Please log in.', 'error');
      return;
    }

    let userId;
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
    } catch (error) {
      showToast('Invalid or expired token. Please log in again.', 'error');
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

    if (customParticipants.length > 0) {
      customParticipants.forEach((email, index) => formData.append(`customParticipants[${index}]`, email.trim()));
    }

    if(formLink) { formData.append('formLink', formLink); }
    if(formId){ formData.append('formId', formId); }
    
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
        response = await axios.put(
          `http://localhost:3000/a/events/${selectedEvent._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        showToast('Event updated successfully');
      } else {
        response = await axios.post('http://localhost:3000/a/events', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast(response.data.message || 'Event created successfully');
      }

      const updatedEvent = {
        ...response.data,
        startTime: new Date(response.data.startTime),
        endTime: new Date(response.data.endTime),
        eventDate: new Date(response.data.eventDate),
      };
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === selectedEvent?._id ? updatedEvent : event
        )
      );
      await fetchEvents();
    } catch (error) {
      showToast('Error saving event: ' + (error.response?.data?.message || error.message));
    } finally {
      try {
        await axios.put(
          `http://localhost:3000/a/events/${selectedEvent._id}/unlock`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsModalOpen(false);
        setSelectedEvent(null);
      }
    }
  };

  const handleSort = (option) => {
    setSortOption(option);
    const sortedEvents = [...events];
    if (option === 'dateAsc') {
      sortedEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    } else if (option === 'dateDesc') {
      sortedEvents.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    } else if (option === 'titleAsc') {
      sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
    } else if (option === 'titleDesc') {
      sortedEvents.sort((a, b) => b.title.localeCompare(a.title));
    }
    setEvents(sortedEvents);
  };
  
  //Fetch Events
  useEffect(() => {
    const lockedEventId = sessionStorage.getItem('lockedEventId');
  if (lockedEventId) {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (token) {
      // Check if the event is locked by another admin
      axios.get(`http://localhost:3000/a/events/${lockedEventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        const event = response.data;
        if (event.lockedBy && event.lockedBy !== jwtDecode(token).id) {
        } else {
          // Proceed with unlocking event
          axios.put(`http://localhost:3000/a/events/${lockedEventId}/unlock`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(error => console.error('Error unlocking event:', error));
        }
      }).catch(error => console.error('Error fetching event lock status:', error));
    }
  }
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

    // Set up activity detection and timeout for inactivity
    useEffect(() => {
      const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          handleCancelEdit(); // Automatically cancel the edit after inactivity
        }, 60000); // 1 minute of inactivity
      };
  
      let inactivityTimer;
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
  
      return () => {
        clearTimeout(inactivityTimer);
        window.removeEventListener('mousemove', resetInactivityTimer);
        window.removeEventListener('keydown', resetInactivityTimer);
      };
    }, [selectedEvent]);

  return (
    <div className="dashboard-container">
      <div className="event-content">
        <div className="dashboard-inline">        
          <h2 className="dashboard-heading">Events</h2>
          <input
            type="text"
            className="search-bar"
            placeholder="Search events..."
            value={searchQuery}
            onChange={handleSearch}
          />
           {/* Sorting Dropdown */}
    <div className="sort-container">
          <label className='sort-label' htmlFor="sort">Sort By:</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="dateAsc">Date (Ascending)</option>
            <option value="dateDesc">Date (Descending)</option>
            <option value="titleAsc">Title (A-Z)</option>
            <option value="titleDesc">Title (Z-A)</option>
          </select>
    </div>
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
          initialEventData={selectedEvent ? {
            ...selectedEvent,
            customParticipants: selectedEvent.customParticipants.map(email => ({ email })) // Wrap emails in objects with email key
          } : null}
        />
  {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={confirmDelete}
        />
   

{/* Events */}
<div className="context-card">
          <div className="admin-event-list">
            {currentEvents.map((event, index) => (
              <div className="admin-event-card" key={`${event._id}-${event.startTime.getTime()}`}>
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
            <button className='prev-next' onClick={prevPage} disabled={currentPage === 1}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            {Array.from({ length: visiblePagesEnd - visiblePagesStart + 1 }, (_, idx) => {
              const page = visiblePagesStart + idx;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`page-button ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              className='prev-next'
              onClick={nextPage}
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