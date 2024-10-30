// EventModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import '../../components/adminbar/css/admin.css';

const EventModal = ({ isOpen, onClose, onSave }) => {
  const [location, setLocation] = useState('');
  const [newEvent, setNewEvent] = useState({
    name: '',
    hostname: '',
    date: '',
    time: '',
    description: '',
  });

  const handleSaveDetails = (e) => {
    e.preventDefault();
    onSave({ ...newEvent, location });
    onClose();
  };

  if (!isOpen) return null;

  return (
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
              onClick={onClose}
            >
              Close
            </button>
            <button type="submit" className="save-button">Save Details</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
