import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './create-event.css';
import CertificateGenerator from '../certificateGenerator/cetificateGenerator';

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
  const [reminders, setReminders] = useState('None');
  const [activeReminder, setActiveReminder] = useState('None');
  const [participants, setParticipants] = useState([]);
  const [participantInput, setParticipantInput] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);



  // Sample data for colleges and departments
  const colleges = ['College of Arts and Sciences', 'College of Business', 'College of Education', 'College of Law', 'College of Nursing', 'College of Technology'];
  const departments = {
    'College of Arts and Sciences': ['Social Sciences', 'Sociology', 'Philosophy', 'Biology or Biological Sciences', 'Environmental Science or Environmental Studies', 'Mathematics', 'English', 'Economics', 'Communication', 'Social Work'],
    'College of Business': ['Accountancy', ' Business Administration', 'Hospitality Management', 'Management'],
    'College of Education': ['Secondary Education', 'Early Childhood Education', 'Elementary Education', 'Physical Education ', 'English Language and Literature'],
    'College of Law': ['Juris Doctor'],
    'College of Nursing': [''],
    'College of Technology': ['Information Technology', 'Electronics Technology', 'Automotive Technology', 'Food Science and Technology', 'Electronics and Communications Engineering'],
  };

  //Temporary Data
  const tempParticipants = [
    {  email: 'alice.smith@example.com', college: 'College of Arts and Sciences', department: 'Mathematics' },
    {  email: 'bob.johnson@example.com', college: 'College of Business', department: 'Business Administration' },
    { email: 'cathy.brown@example.com', college: 'College of Education', department: 'Secondary Education' },
   
  ];


  const toggleFilterVisibility = () => {
    setIsFilterVisible((prev) => !prev);
  };

  const toggleParticipantSelection = (participant) => {
    if (selectedParticipants.includes(participant.email)) {
      setSelectedParticipants(selectedParticipants.filter(email => email !== participant.email));
    } else {
      setSelectedParticipants([...selectedParticipants, participant.email]);
    }
  };
  
  const filteredParticipants = () => {
    return tempParticipants.filter(participant => {
      const collegeMatch = selectedCollege ? participant.college === selectedCollege : true;
      const departmentMatch = selectedDepartment ? participant.department === selectedDepartment : true;
      const searchMatch = participant.email.toLowerCase().includes(searchTerm.toLowerCase()); // New search condition
      return collegeMatch && departmentMatch && searchMatch; // Combine conditions
    });
  };

  const handleReminderClick = (reminder) => {
    setReminders(reminder);
    setActiveReminder(reminder);
  };

  const handleParticipantInputChange = (e) => {
    setParticipantInput(e.target.value);
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();
    onSave({ ...newEvent, date, startTime, endTime, location, participants });
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
              <input type="text" placeholder="Event Summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="form-control mb-3" />
              <input type="text" placeholder="Enter Hostname" onChange={(e) => setNewEvent({ ...newEvent, hostname: e.target.value })} className="form-control mb-3" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-control mb-3" />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="form-control mb-3" />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="form-control mb-3" />
              <textarea placeholder="Enter event description" onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="form-control mb-3"></textarea>

              <div className="reminder-section mb-3">
                <div className="reminder-options">
                  <button type="button" className={`btn btn-sm ${activeReminder === 'None' ? 'active' : ''}`} onClick={() => handleReminderClick('None')}>None</button>
                  <button type="button" className={`btn btn-sm ${activeReminder === '1 hour before' ? 'active' : ''}`} onClick={() => handleReminderClick('1 hour before')}>1 hour before</button>
                  <button type="button" className={`btn btn-sm ${activeReminder === '1 day before' ? 'active' : ''}`} onClick={() => handleReminderClick('1 day before')}>1 day before</button>
                  <button type="button" className={`btn btn-sm ${activeReminder === '1 week before' ? 'active' : ''}`} onClick={() => handleReminderClick('1 week before')}>1 week before</button>
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

                {/* Participant Filter Section */}
                {isFilterVisible && (
                  <div className="card-filter">
                    <div className="participant-filter-custom mt-1">
                      <div className="filter-section-custom mb-1">
                        <div className="row-custom">
                          <div className="col-6-custom">
                            <select
                              value={selectedCollege}
                              onChange={(e) => setSelectedCollege(e.target.value)}
                              className="custom-form-control"
                            >
                              <option value="">All Colleges</option>
                              {colleges.map((college, index) => (
                                <option key={index} value={college}>{college}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-6-custom">
                            <select
                              value={selectedDepartment}
                              onChange={(e) => setSelectedDepartment(e.target.value)}
                              className="custom-form-control"
                            >
                              <option value="">All Departments</option>
                              {selectedCollege && departments[selectedCollege].map((department, index) => (
                                <option key={index} value={department}>{department}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Add participants"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="custom-form-control mb-1"
                      />

                      <div className="card-list">
                        <ul className="participant-list-group mt-1">
                          {filteredParticipants().map((participant, index) => (
                            <li key={index} className="participant-item">
                              <label className="participant-label">
                                <span>
                                   {participant.email}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={selectedParticipants.includes(participant.email)}
                                  onChange={() => toggleParticipantSelection(participant)}
                                />
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate Generator Section */}
              <div className="certificate-section mt-3">
                <CertificateGenerator />
              </div>


              <div className="modal-buttons mt-3">
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