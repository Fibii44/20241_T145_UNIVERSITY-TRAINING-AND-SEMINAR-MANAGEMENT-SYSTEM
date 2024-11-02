import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faClock, faPlus, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import './css/eventM.css';
import Sidebar from '../../components/admin/adminbar/sidebar';
import Topbar from '../../components/admin/adminbar/topbar';
import EventModal from '../../components/admin/admin_create-events/create-events';

const EventM = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSaveEventDetails = async (eventDetails) => {
    try {
      const response = await axios.post('http://localhost:3000/api/events', eventDetails);
      alert(response.data.message || 'Event created successfully');
      setEvents([...events, response.data]); // Update local state with the newly created event
    } catch (error) {
      alert('Error creating event: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="events" />
      <div className="content">
        <Topbar />
        <div className="dashboard-inline">
          <h2 className="dashboard-heading">Events</h2>
          <button className="dashboard-button" onClick={toggleModal}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <EventModal isOpen={isModalOpen} onClose={toggleModal} onSave={handleSaveEventDetails} />
        <div className="context-card">
          <div className="events-list">
            {events.map((event, index) => (
              <div className="event-card" key={index}>
                <div className="event-details">
                  <h3 className="event-title">{event.summary}</h3>
                  <p className="event-description">{event.description}</p>
                  <div className="event-info">
                    <span><FontAwesomeIcon icon={faCalendarCheck} /> {event.date}</span>
                    <span><FontAwesomeIcon icon={faClock} /> {event.startTime} - {event.endTime}</span>
                    <span><FontAwesomeIcon icon={faMapMarkerAlt} /> {event.location}</span>
                  </div>
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