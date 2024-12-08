import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faMapMarkerAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './createEvent.css';
import TimePicker from 'react-bootstrap-time-picker';
import { jwtDecode } from 'jwt-decode';

const EventModal = ({ isOpen, onClose, onSave, userRole, userCollege, initialEventData = null }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reminders, setReminders] = useState([]);
  const [eventPicture, setEventPicture] = useState(null);
  const [activeReminder, setActiveReminder] = useState('None');
  const [color, setColor] = useState('#65a8ff');
  const [participants, setParticipants] = useState({
    college: '',
    department: ''
  });
  const [fetchedParticipants, setFetchedParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState(initialEventData?.customParticipants || []);
  const [isFilterVisible, setIsFilterVisible] = useState(false); // Track filter visibility state
  const [searchTerm, setSearchTerm] = useState('');
  const [ formLink, setFormLink] = useState('');
  const [formId, setFormId] = useState('');

  // Sample data for colleges and departments
  const colleges = ['College of Arts and Sciences', 'College of Business', 'College of Education', 'College of Law', 'College of Public Administration and Governance', 'College of Nursing', 'College of Technologies'];
  const departments = {
    'College of Arts and Sciences': ['Social Sciences', 'Sociology', 'Philosophy', 'Biology', 'Environmental Science', 'Mathematics', 'English', 'Economics', 'Communication', 'Social Work'],
    'College of Business': ['Accountancy', 'Business Administration', 'Hospitality Management', 'Management'],
    'College of Education': ['Secondary Education', 'Early Childhood Education', 'Elementary Education', 'Physical Education', 'English Language and Literature'],
    'College of Law': ['Juris Doctor'],
    'College of Public Administration and Governance': [],
    'College of Nursing': [],
    'College of Technologies': ['Information Technology', 'Electronics Technology', 'Automotive Technology', 'Food Science and Technology', 'Electronics and Communications Engineering'],
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
      const url = `http://localhost:3000/a/event-participants${params}`;

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
    if (reminder === 'None') {
      setReminders([]);
      setActiveReminder('None');
    } else {
      const reminderTime = getReminderTimeInMinutes(reminder);
      setReminders([{ method: 'popup', minutesBefore: reminderTime }]);
      setActiveReminder(reminder);
    }
  };

  const getReminderTimeInMinutes = (reminder) => {
    switch (reminder) {
      case '1 hour before':
        return 60;
      case '1 day before':
        return 1440;
      case '1 week before':
        return 10080;
      case 'None':
        return 0;  // None means zero minutes
      default:
        return 0;
    }
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
      setReminders(initialEventData.reminders || []);
      setColor(initialEventData.color || '');
      setSelectedParticipants(initialEventData.customParticipants || []);
      setParticipants({
        college: initialEventData.participantGroup?.college || '',
        department: initialEventData.participantGroup?.department || ''
      });
      setFormLink(initialEventData.formLink || '');
      setFormId(initialEventData.formId || '');
    }
  }, [isOpen, initialEventData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventPicture(file);
    }
  };

  
  const handleSaveDetails = async (e) => {
    e.preventDefault();
  
    // Get the user's timezone offset in minutes
    const timezoneOffset = new Date().getTimezoneOffset();
    const timezoneOffsetHours = Math.abs(Math.floor(timezoneOffset / 60));
    const timezoneOffsetMinutes = Math.abs(timezoneOffset % 60);
  
    // Format the offset as "+HH:MM" or "-HH:MM"
    const formattedOffset =
      (timezoneOffset > 0 ? "-" : "+") +
      String(timezoneOffsetHours).padStart(2, "0") +
      ":" +
      String(timezoneOffsetMinutes).padStart(2, "0");
  
    // Combine date and time inputs and append timezone offset
    const combinedStart = new Date(`${date}T${startTime}:00${formattedOffset}`);
    const combinedEnd = new Date(`${date}T${endTime}:00${formattedOffset}`);
  
    const isoStartTime = combinedStart.toISOString();
    const isoEndTime = combinedEnd.toISOString();
  
    // Assign colors based on selected college
    let eventColor;
    switch (participants.college) {
      case 'College of Arts and Sciences':
        eventColor = '#72f7b0'; // Green
        break;
      case 'College of Business':
        eventColor = '#c9be3a'; // Yellow
        break;
      case 'College of Education':
        eventColor = '#727bf7'; // Blue
        break;
      case 'College of Law':
        eventColor = '#ae72f7'; // Purple
        break;
      case 'College of Nursing':
        eventColor = '#f772b0'; // Pink
        break;
      case 'College of Public Administration and Governance':
        eventColor = '#442859';
        break;
      case 'College of Technologies':
        eventColor = '#f78f72'; // Orange
        break;
      default:
        eventColor = '#65a8ff'; // Default Blue
    }
  
    // Clean participant emails
    const cleanedParticipants = selectedParticipants
      .map((participant) => participant.email.trim()) // Remove extra spaces
      .filter((email) => email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)); // Validate email format
  
    console.log("Event Picture before save:", eventPicture);
  
    // Prepare event data
    const eventData = {
      title,
      date,
      eventPicture,
      startTime: isoStartTime,
      endTime: isoEndTime,
      location,
      description,
      reminders,
      participants,
      formLink,
      formId,
      customParticipants: cleanedParticipants, // Include selected participants in the saved event
      color: eventColor,
    };
  
    try {
      // Save the event
      await onSave(eventData);
      
      // Send notifications
      const notificationData = {
        title: `Invitation to ${title}`,
        message: `You are invited to attend the event: "${title}" on ${date} at ${location}.`,
        customParticipants: cleanedParticipants,

      };
  
      await axios.post('http://localhost:3000/a/notification/items', notificationData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Notifications sent successfully');
    } catch (error) {
      console.error('Error saving event or sending notifications:', error);
    }
  
    onClose();
  };
  
  if (!isOpen) return null;

  // Function to validate Google Form URL
  const validateFormLink = (url) => {
    // Patterns for both full and shortened Google Form URLs
    const patterns = [
      /^https:\/\/docs\.google\.com\/forms\/d\/e\//, // Full URL
      /^https:\/\/forms\.gle\//, // Shortened URL
      /^https:\/\/docs\.google\.com\/forms\/d\// // Direct form URL
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  // Handler for form link changes
  const handleFormLinkChange = (e) => {
    const url = e.target.value.trim();
    if (url && !validateFormLink(url)) {
      alert('Please enter a valid Google Forms URL');
      return;
    }
    setFormLink(url);
  };

  const handleFormIdChange = (e) => {
    const id = e.target.value.trim();
    if(id && !validateFormLink(id)){
      alert('Please enter a valid Google Forms ID');
      return;
    }
    setFormId(id);
  };


  return (
    <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div className={`modal ${isOpen ? 'show' : ''}`} style={{ display: isOpen ? 'block' : 'none' }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h5 className="modal-title">Event Details</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form className="event-form fo" onSubmit={handleSaveDetails}>
              <div className="event-row"> {/* Added a row container */}
                <div className="col-md-5"> {/* Assigned columns for side-by-side layout */}
                  <div className="upload-photo">
                    <label htmlFor="file-upload">
                      {eventPicture ? (
                        <img src={URL.createObjectURL(eventPicture)} alt="Selected Image" />
                      ) : (
                        <FontAwesomeIcon icon={faCamera} className="camera-icon" />
                      )}
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      name="eventPicture"
                      onChange={handleImageChange}
                      style={{ display: 'none' }} // Hide default input
                    />
                  </div>
                </div>
                <div className="col-md-7"> {/* Assigned columns for side-by-side layout */}
                  <div className="event-details" style={{paddingTop: '0px'}}> {/* Added a container for better styling */}
                      <input className="event-name form-control mb-3" type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <div className="event-inputs">
                      <input className="event-date form-control mb-3" type="date" placeholder="Event Date" value={date} onChange={(e) => setDate(e.target.value)} />
                      <input className="form-control mb-3" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                      <input className="form-control mb-3" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                    <textarea className="event-description form-control mb-3" placeholder="Enter event description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    <div className="location-input mb-4">
                      <input type="text" placeholder="Enter location" value={location} onChange={(e) => setLocation(e.target.value)} className="form-control" />
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                    </div>
                    <div className="reminder-section">
                    <h6 style={{color: "gray"}}>Set Reminder for Participants</h6>
                      <select className="form-select" value={activeReminder} onChange={(e) => handleReminderClick(e.target.value)}>
                        <option value="None">None</option>
                        <option value="1 hour before">1 hour before</option>
                        <option value="1 day before">1 day before</option>
                        <option value="1 week before">1 week before</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              

            


                <div className="additional-options mb-3">
                <hr />  <div className="google-form-section mb-3">
                  <h4><strong>Post-Event Settings</strong></h4>
                  <div className="google-form-row">
                    
                    <div className="col-md-5">
                      <p>Enter the Google Form link for respondent form.</p>
                      <input 
                        type="text" 
                        placeholder="Google Form Link" 
                        value={formLink} 
                        onChange={handleFormLinkChange} 
                        className="google-form-control mb-3"
                      />
                    </div>
                    <div className="col-md-5">
                      <p>Enter the Google Form Link with Edit Access</p>
                      <input 
                        type="text" 
                        placeholder="Google Form ID" 
                        value={formId} 
                        onChange={handleFormIdChange} 
                        className="form-control mb-2"
                      />
                    </div>
                    </div>
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

                    
                        <input
                          type="text"
                          placeholder="Invite Participants by Email"
                          value={searchTerm}
                          onChange={handleSearch}
                          className="form-control mb-3"
                        />
                

                      {searchTerm && (
                        <div className="participants-list">
                          {filteredParticipants().map((participant) => (
                            <div
                              key={participant.email}
                              onClick={() => handleAddParticipant(participant)}
                              className="participant-item-list"
                            >
                              <div className="participant-info">
                                <img src={participant.profilePicture} alt="Profile" className="participant-img" />
                                <span className="participant-email">{participant.email}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="selected-participants">
                        <h4 className="select-label">Selected Participants</h4>

                        {/* Map through the selected participants and display them */}
                        {selectedParticipants.map((participant) => (
                          <div key={participant.email} className="participant-item">
                            <li className="selected-participant">
                              <div className="participant-info">
                                <span className="participant-email">{participant.email}</span>
                              </div>
                              <button className="cancel-btn" onClick={() => handleRemoveParticipant(participant.email)}>
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </li>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="event-buttons">
                <button type="submit" className="btn btn-primary mr-2 event-save-button">Save Event</button>
                <button type="button" className="btn btn-secondary event-close-button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default EventModal;
    