import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarCheck, faClock, faPlus, faMapMarkerAlt, faCamera } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../component/adminbar/sidebar';
import Topbar from '../../component/adminbar/topbar';
import '../../component/adminbar/css/admin.css';

const EventM = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [newEvent, setNewEvent] = useState({
    name: '',
    hostname: '',
    date: '',
    time: '',
    description: '',
  });

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();
    console.log('Event details saved:', { ...newEvent, location });
    handleCloseModal();
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

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="upload-photo">
                <FontAwesomeIcon icon={faCamera} className="camera-icon" />
                <p>Upload Photo</p>
              </div>
              <form className="event-form" onSubmit={handleSaveDetails}>
                <label>Enter Event Name</label>
                <input
                  type="text"
                  placeholder="Enter event name"
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                />

                <label>Enter Hostname</label>
                <input
                  type="text"
                  placeholder="Enter Hostname"
                  onChange={(e) => setNewEvent({ ...newEvent, hostname: e.target.value })}
                />

                <label>Event Date</label>
                <input
                  type="date"
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />

                <label>Event Time</label>
                <input
                  type="time"
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />

                <label>Event Description</label>
                <textarea
                  placeholder="Enter event description"
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                ></textarea>

                <div className="reminder-section">
                  <label>Set Reminder</label>
                  <div className="reminder-options">
                    <button type="button">None</button>
                    <button type="button">1 hour before</button>
                    <button type="button">1 day before</button>
                    <button type="button">1 week before</button>
                  </div>
                </div>
                <div className="additional-options">
                  <div className="location-input">
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                  </div>
                  <button type="button">Insert Certificate Template</button>
                  <button type="button">+ Invite Participants</button>
                </div>

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="close-button"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                  <button type="submit" className="save-button">Save Details</button>
                </div>
              </form>
            </div>
          </div>
        )}
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
