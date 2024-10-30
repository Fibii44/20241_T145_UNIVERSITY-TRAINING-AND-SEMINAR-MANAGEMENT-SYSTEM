import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../component/adminbar/sidebar';
import Topbar from '../../component/adminbar/topbar';
import '../../component/adminbar/css/admin.css';

const EventM = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const events = [
    {
      id: 1,
      title: 'GAD SEMINAR',
      description: 'Gender and Development 21st Certificate Course in Industrial Relations and Human Resource Management',
      date: 'October 16, 2024',
      time: '5:30 am',
      location: 'BukSU Mini Theater',
      image: 'path/to/image1.png' // Replace with actual image path
    },
    {
      id: 2,
      title: 'IALU LEADERS TRAINING',
      description: 'Hansen Leadership Institute 2025 in USA (Fully Funded) 3 Weeks Summer Exchange Program at the San Diego, California.',
      date: 'March 10, 2025',
      time: '11:30 am',
      location: 'BukSU Research Center',
      image: 'path/to/image2.png' // Replace with actual image path
    },
    {
      id: 3,
      title: 'MENTAL HEALTH SEMINAR',
      description: 'COT Mental Health Awareness Seminar',
      date: 'March 10, 2025',
      time: '11:30 am',
      location: 'BukSU Research Center',
      image: 'path/to/image3.png' // Replace with actual image path
    },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="events" />
      <div className="content">
        <Topbar />
        <h2 className="dashboard-heading">Events</h2>
        
        <div className="events-list">
          {events.map((event) => (
            <div className="event-card" key={event.id}>
              <img src={event.image} alt={event.title} className="event-image" />
              <div className="event-details">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
                <div className="event-info">
                  <span><FontAwesomeIcon icon={faCalendarCheck} /> {event.date}</span>
                  <span><FontAwesomeIcon icon={faClock} /> {event.time}</span>
                  <span><FontAwesomeIcon icon={faUser} /> {event.location}</span>
                </div>
              </div>
              <div className="event-actions">
                <button className="edit-button">Edit</button>
                <button className="delete-button">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventM;
