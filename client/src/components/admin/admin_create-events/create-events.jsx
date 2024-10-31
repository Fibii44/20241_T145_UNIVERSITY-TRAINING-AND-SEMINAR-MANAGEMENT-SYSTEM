import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import './create-event.css';

const EventModal = ({ isOpen, onClose, onSave }) => {
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [newEvent, setNewEvent] = useState({
    name: '',
    hostname: '',
    description: '',
  });

  const createEvent = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/events', {
        summary,
        date,
        startTime,
        endTime,
        location,
      });
      alert(response.data);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event: ' + (error.response ? error.response.data : error.message));
    }
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();
    // Save the event details and close the modal
    onSave({ ...newEvent, date, startTime, endTime, location });
    createEvent(); // Call the create event function to send the event data to the server
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div
        className={`modal ${isOpen ? 'show' : ''}`}
        style={{ display: isOpen ? 'block' : 'none' }}
        onClick={(e) => e.stopPropagation()} // Prevents overlay click from closing modal
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Event Details</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="upload-photo">
              <FontAwesomeIcon icon={faCamera} className="camera-icon" />
              <p>Upload Photo</p>
            </div>
            <form className="event-form" onSubmit={handleSaveDetails}>
              <label>Enter Event Summary</label>
              <input
                type="text"
                placeholder="Event Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="form-control mb-3"
              />

              <label>Enter Hostname</label>
              <input
                type="text"
                placeholder="Enter Hostname"
                onChange={(e) => setNewEvent({ ...newEvent, hostname: e.target.value })}
                className="form-control mb-3"
              />

              <label>Event Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-control mb-3"
              />

              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="form-control mb-3"
              />

              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="form-control mb-3"
              />

              <label>Event Description</label>
              <textarea
                placeholder="Enter event description"
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="form-control mb-3"
              ></textarea>

              <div className="reminder-section mb-3">
                <label>Set Reminder</label>
                <div className="reminder-options">
                  <button type="button" className="btn btn-outline-secondary btn-sm">None</button>
                  <button type="button" className="btn btn-outline-secondary btn-sm">1 hour before</button>
                  <button type="button" className="btn btn-outline-secondary btn-sm">1 day before</button>
                  <button type="button" className="btn btn-outline-secondary btn-sm">1 week before</button>
                </div>
              </div>

              <div className="additional-options mb-3">
                <div className="location-input">
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-control"
                  />
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                </div>

                <button type="button" className="cert-template-btn">Insert Certificate Template</button>
                <button type="button" className="invite-participants-btn">+ Invite Participants</button>
              </div>

              <div className="modal-buttons">
                <button type="button" className="close-button" onClick={onClose}>Close</button>
                <button type="submit" className="save-button">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
