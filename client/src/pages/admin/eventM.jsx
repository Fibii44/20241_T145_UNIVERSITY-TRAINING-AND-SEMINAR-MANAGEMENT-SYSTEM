// EventM.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarCheck, faClock, faPlus, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/admin/adminbar/sidebar';
import Topbar from '../../components/admin/adminbar/topbar';
import EventModal from '../../components/admin/admin_create-events/create-events'; 
import '../../components/admin/adminbar/css/admin.css';

const EventM = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSaveEventDetails = (eventDetails) => {
    console.log('Event details saved:', eventDetails);
    // Here you can handle saving the event details
  };

  const events = [
    {
      id: 1,
      title: 'GAD SEMINAR',
      description: 'Gender and Development 21st Certificate Course in Industrial Relations and Human Resource Management',
      date: 'October 16, 2024',
      time: '5:30 am',
      location: 'BukSU Mini Theater',
      image: 'path/to/image1.png'
    },
    {
      id: 2,
      title: 'IALU LEADERS TRAINING',
      description: 'Hansen Leadership Institute 2025 in USA (Fully Funded) 3 Weeks Summer Exchange Program at the San Diego, California.',
      date: 'March 10, 2025',
      time: '11:30 am',
      location: 'BukSU Research Center',
      image: 'path/to/image2.png'
    },
    {
      id: 3,
      title: 'MENTAL HEALTH SEMINAR',
      description: 'COT Mental Health Awareness Seminar',
      date: 'March 10, 2025',
      time: '11:30 am',
      location: 'BukSU Research Center',
      image: 'path/to/image3.png'
    },
  ];

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

        {/* Use the EventModal component */}
        <EventModal 
          isOpen={isModalOpen} 
          onClose={toggleModal} 
          onSave={handleSaveEventDetails} 
        />

        <div className="context-card">
          <div className="events-list">
            {events.map((event) => (
              <div className="event-card" key={event.id}>
                <img src={event.image} alt={event.title} className="event-image" />
                <div className="event-details">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  <div className="event-info">
                    <span>
                      <FontAwesomeIcon icon={faCalendarCheck} /> {event.date}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faClock} /> {event.time}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faMapMarkerAlt} /> {event.location}
                    </span>
                    <div className="event-actions">
                      <button className="edit-button">Edit</button>
                      <button className="delete-button">Delete</button>
                    </div>
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
