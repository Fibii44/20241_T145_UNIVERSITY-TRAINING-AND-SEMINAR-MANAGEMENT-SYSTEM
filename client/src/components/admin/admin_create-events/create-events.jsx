import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faMapMarkerAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './create-event.css';
import { jwtDecode } from 'jwt-decode';
import CertificateGenerator from '../certificateGenerator/certificateGenerator';

const EventModal = ({ isOpen, onClose, onSave, userRole, userCollege, initialEventData = null }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reminders, setReminders] = useState('None');
  const [image, setImage] = useState(null);
  const [activeReminder, setActiveReminder] = useState('None');
  const [participants, setParticipants] = useState({
    college: '',
    department: ''
  });
  const [fetchedParticipants, setFetchedParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState(initialEventData?.customParticipants || []);
  const [isFilterVisible, setIsFilterVisible] = useState(false); // Track filter visibility state
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for colleges and departments
  const colleges = ['College of Arts and Sciences', 'College of Business', 'College of Education', 'College of Law', 'College of Nursing', 'College of Technology'];
  const departments = {
    'College of Arts and Sciences': ['Social Sciences', 'Sociology', 'Philosophy', 'Biology', 'Environmental Science', 'Mathematics', 'English', 'Economics', 'Communication', 'Social Work'],
    'College of Business': ['Accountancy', 'Business Administration', 'Hospitality Management', 'Management'],
    'College of Education': ['Secondary Education', 'Early Childhood Education', 'Elementary Education', 'Physical Education', 'English Language and Literature'],
    'College of Law': ['Juris Doctor'],
    'College of Nursing': [],
    'College of Technology': ['Information Technology', 'Electronics Technology', 'Automotive Technology', 'Food Science and Technology', 'Electronics and Communications Engineering'],
  };

  const fetchParticipants = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }
  
      // Build the URL with query parameters
      const params = participants.college === "All" ? '' : `?college=${encodeURIComponent(participants.college)}`;
      const url = `http://localhost:3000/a/users${params}`;
  
      console.log("Request URL:", url);
      console.log("Authorization Token:", token);
  
      // Make the fetch request with authorization header
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      // Check if the response is OK, else throw an error
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
  
      // Parse the response JSON
      const data = await response.json();
      setFetchedParticipants(Array.isArray(data) ? data : []); // Ensure fetchedParticipants is always an array
  
    } catch (error) {
      console.error('Error fetching participants:', error);
      setFetchedParticipants([]); // Default to empty array on error
    }
  };
  
  useEffect(() => {
    fetchParticipants();
  }, [participants.college, participants.department]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  };

  const handleAddParticipant = (participant) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex pattern
  
    if (!emailPattern.test(participant.email)) {
      alert('Invalid email format');
      return;
    }
  
    if (!selectedParticipants.find((p) => p.email === participant.email)) {
      setSelectedParticipants((prev) => [...prev, participant]);
    }
  };

  const handleRemoveParticipant = (email) => {
    setSelectedParticipants((prev) => prev.filter(p => p.email !== email));
  };

  const filteredParticipants = () => {
    return (fetchedParticipants || []).filter(participant => 
      participant.email.toLowerCase().includes(searchTerm) &&
      !selectedParticipants.some(p => p.email === participant.email)
    );
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(prev => !prev); // Toggle the visibility of the filter
  };

  const handleReminderClick = (reminder) => {
    setReminders(reminder);
    setActiveReminder(reminder);
  };

  const handleCollegeChange = (e) => {
    const selectedCollege = e.target.value;
    setParticipants(prev => ({
      ...prev,
      college: selectedCollege === "" ? "All" : selectedCollege,
      department: '' // Reset department when college changes
    }));
  };
  
  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setParticipants(prev => ({
      ...prev,
      department: selectedDepartment === "" ? "All Departments" : selectedDepartment
    }));
  };

  useEffect(() => {
    if (isOpen && initialEventData) {
      // Populate form fields when initialEventData changes
      setTitle(initialEventData.title || '');
      setDate(initialEventData.eventDate || '');
      setStartTime(initialEventData.startTime || '');
      setEndTime(initialEventData.endTime || '');
      setLocation(initialEventData.location || '');
      setDescription(initialEventData.description || '');
      setReminders(initialEventData.reminders || 'None');
      setSelectedParticipants(initialEventData.customParticipants || []);
      setParticipants({
        college: initialEventData.participantGroup?.college || '',
        department: initialEventData.participantGroup?.department || ''
      });
    }
  }, [isOpen, initialEventData]);

  const handleSaveDetails = (e) => {
    e.preventDefault();

    const cleanedParticipants = selectedParticipants
    .map((participant) => participant.email.trim()) // Remove extra spaces
    .filter((email) => email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)); // Validate email format

    onSave({
      title,
      date,
      startTime,
      endTime,
      location,
      description,
      reminders,
      participants,
      customParticipants: cleanedParticipants // Include selected participants in the saved event
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div className={`modal ${isOpen ? 'show' : ''}`} style={{ display: isOpen ? 'block' : 'none' }} onClick={(e) => e.stopPropagation()}>
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
              <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} className="form-control mb-3" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-control mb-3" />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="form-control mb-3" />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="form-control mb-3" />
              <textarea placeholder="Enter event description" value={description} onChange={(e) => setDescription(e.target.value)} className="form-control mb-3"></textarea>

              <div className="reminder-section mb-3">
                <div className="reminder-options">
                  {['None', '1 hour before', '1 day before', '1 week before'].map((reminder) => (
                    <button
                      key={reminder}
                      type="button"
                      className={`btn btn-sm ${activeReminder === reminder ? 'active' : ''}`}
                      onClick={() => handleReminderClick(reminder)}
                    >
                      {reminder}
                    </button>
                  ))}
                </div>
              </div>

              <div className="additional-options mb-3">
                <div className="location-input">
                  <input type="text" placeholder="Enter location" value={location} onChange={(e) => setLocation(e.target.value)} className="form-control" />
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                </div>

                <button type="button" className="invite-participants-btn" onClick={toggleFilterVisibility}>
                  + Invite Participants
                </button>

                {isFilterVisible && (
                  <div className="card-filter">
                    <div className="participant-filter-custom mt-1">
                      <div className="filter-section-custom mb-1">
                        <div className="row-custom">
                          <div className="col-6-custom">
                            <select value={participants.college} onChange={handleCollegeChange} className="custom-form-control">
                              <option value="">All</option>
                              {colleges.map((college, index) => (
                                <option key={index} value={college}>{college}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-6-custom">
                          <select
                            value={participants.department}
                            onChange={handleDepartmentChange}
                            className="custom-form-control"
                            disabled={!participants.college || participants.college === "All"} // Disable if "All" is selected
                          >
                            <option value="">All Departments</option>
                            {(departments[participants.college] || []).map((department, index) => (
                              <option key={index} value={department}>{department}</option>
                            ))}
                          </select>
                          </div>
                        </div>
                      </div>

                      <div className="search-input mb-1">
                        <input
                          type="text"
                          placeholder="Search participants by email"
                          value={searchTerm}
                          onChange={handleSearch}
                          className="form-control"
                        />
                      </div>

                      {searchTerm && (
                        <div className="participants-list">
                          {filteredParticipants().map((participant) => (
                            <div
                              key={participant.email}
                              onClick={() => handleAddParticipant(participant)}
                              className="participant-item"
                            >
                              <span>{participant.email}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="selected-participants">
                        <h4>Selected Participants</h4>
                        {selectedParticipants.map((participant) => (
                          <div key={participant.email} className="participant-item">
                            <span>{participant.email}</span>
                            <button onClick={() => handleRemoveParticipant(participant.email)}>
                              <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary">Save Event</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
