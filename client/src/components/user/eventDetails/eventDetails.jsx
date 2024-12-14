import React, { useState, useEffect, useDebugValue } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './eventDetails.css'
import Toast from '../../modals/successToast/toast'

function Event() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showImage, setShowImage] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState("Register");
    const [googleEventId, setGoogleEventId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [canRegister, setCanRegister] = useState(false);
    const [isEventActive, setIsEventActive] = useState(false);
    const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
    const [formStatus, setFormStatus] = useState(null);
    const [certificateStatus, setCertificateStatus] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle' | 'waiting' | 'checking' | 'success' | 'error'
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const checkEventTime = () => {
        if (!event) { return false; }
        const currentTime = new Date();
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);

        return currentTime < eventStart
    }

    const isEventCompleted = () => {
        if (!event) { return false; }
        const currentTime = new Date();
        const eventEnd = new Date(event.endTime);

        return currentTime > eventEnd;
    };

    // Function to check if user can access form
    const canAccessForm = () => {
        return (
            isRegistered &&
            event &&
            isEventCompleted(event) &&
            event.formLink &&
            !hasSubmittedForm
        );
    };

    // Check form status
    const checkFormStatus = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            if (!token) {
                console.log('No token found');
                return;
            }

            // First check if there's a registration
            const regResponse = await axios.get(`http://localhost:3000/u/events/${id}/check-registration`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!regResponse.data.isRegistered) {
                console.log('User not registered for this event');
                return;
            }

            const response = await axios.get(`http://localhost:3000/u/events/${id}/form-status`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormStatus(response.data);
            setHasSubmittedForm(response.data.hasSubmittedForm);
            if (response.data.hasSubmittedForm) {
                setCertificateStatus(response.data.certificateGenerated ? 'generated' : 'pending');
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('No form submission found');
                setHasSubmittedForm(false);
            } else {
                console.error('Error checking form status:', error);
            }
        }
    };

    // Handle form submission
    const handleFormSubmission = async () => {
        try {
            setSubmissionStatus('checking');
            setSubmissionMessage('Verifying your form submission...');
            setIsLoading(true);

            const token = sessionStorage.getItem('authToken');
            if (!token) {
                throw new Error('Please log in to submit the form');
            }

            if (!event.formLink) {
                throw new Error('Invalid form link. Please contact the event organizer.');
            }

            // Updated form link validation to handle more Google Form URL patterns
            const formId = event.formLink.match(/\/forms\/d\/e\/([^/]+)\//) ||  // Pattern 1: .../forms/d/e/[formId]/...
                event.formLink.match(/\/forms\/d\/([^/]+)\//) ||      // Pattern 2: .../forms/d/[formId]/...
                event.formLink.match(/\/forms\/([^/]+)/) ||           // Pattern 3: .../forms/[formId]
                event.formLink.match(/forms.gle\/(\w+)/);             // Pattern 4: forms.gle/[shortId]

            if (!formId || !formId[1]) {
                console.error('Form link:', event.formLink); // For debugging
                throw new Error('Could not process form link. Please contact the event organizer.');
            }

            // Add a small delay to allow Google Form submission to be recorded
            await new Promise(resolve => setTimeout(resolve, 3000));

            const response = await axios.post(
                `http://localhost:3000/u/events/${id}/form-submission`,
                {
                    formId: formId[1],
                    formLink: event.formLink
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.hasSubmittedForm) {
                setHasSubmittedForm(true);
                setFormStatus(response.data);
                setSubmissionStatus('success');
                setSubmissionMessage('Form submission verified successfully! Your certificate will be available soon.');
                checkFormStatus();
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmissionStatus('error');
            if (error.response?.status === 404) {
                setSubmissionMessage('Your form submission was not found. Please make sure you submit the form using your registered email address.');
            } else {
                setSubmissionMessage(error.message || 'Failed to record form submission. Please try again.');
            }
            setHasSubmittedForm(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Update the form link click handler
    const handleFormLinkClick = (e) => {
        e.preventDefault();
        if (!event.formLink) {
            showToast('Form link is not available. Please contact the event organizer.', 'error');
            return;
        }

        // Set status to waiting
        setSubmissionStatus('waiting');
        setSubmissionMessage('Please complete and submit the form. After submission, click "Verify Submission" below.');

        // Open form in new tab
        window.open(event.formLink, '_blank');
    };

    // Separate verify button component
    const VerifySubmissionButton = () => (
        <button
            onClick={handleFormSubmission}
            disabled={isLoading}
            className="verify-submission-btn"
        >
            {isLoading ? 'Verifying...' : 'Verify Submission'}
        </button>
    );


    useEffect(() => {
        const fetchEventAndData = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem('authToken');

                // First fetch event details
                console.log("Fetching event with ID:", id);
                const eventResponse = await axios.get(`http://localhost:3000/u/events/${id}`, {headers: { Authorization: `Bearer ${token}` }});
                setEvent(eventResponse.data);

                if (token) {
                    // Check registration status
                    const regResponse = await axios.get(`http://localhost:3000/u/events/${id}/check-registration`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setIsRegistered(regResponse.data.isRegistered);
                    setRegistrationStatus(regResponse.data.isRegistered ? "Cancel Registration" : "Register");
                    setGoogleEventId(regResponse.data.googleEventId || null);

                    // Set user access
                    const decodedToken = jwtDecode(token);
                    setCurrentUser(decodedToken);

                    // Check registration eligibility
                    const hasCustomParticipants = eventResponse.data?.customParticipants?.length > 0;
                    setCanRegister(hasCustomParticipants
                        ? eventResponse.data.customParticipants.includes(decodedToken.email)
                        : !eventResponse.data?.participantGroup?.college ||
                        eventResponse.data.participantGroup.college === " " ||
                        eventResponse.data.participantGroup.college === "All" ||
                        eventResponse.data.participantGroup.college === decodedToken.department
                    );

                    // Only check form status if:
                    // 1. User is registered
                    // 2. Event has a form link
                    // 3. Event is completed
                    if (regResponse.data.isRegistered &&
                        eventResponse.data.formLink &&
                        new Date() > new Date(eventResponse.data.endTime)) {
                        try {
                            await checkFormStatus();
                        } catch (error) {
                            console.log('Form status check failed:', error);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.response?.status === 404
                    ? "Event not found"
                    : "Failed to fetch event data"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndData();
    }, [id]);

    // Update event active status whenever event changes
    useEffect(() => {
        if (event) {
            setIsEventActive(checkEventTime());
        }
    }, [event]);


    useEffect(() => {
        const checkCertificateStatus = async () => {
            try {
                const token = sessionStorage.getItem('authToken');
                const response = await axios.get(
                    `http://localhost:3000/u/events/${id}/certificate-status`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
        
                if (response.data.status === 'generated') {
                    setCertificateStatus('generated');
                    showToast('Your certificate is ready!', 'success');
                } else {
                    setTimeout(checkCertificateStatus, 10000);
                }
            } catch (error) {
                console.error('Error checking certificate status:', error);
                showToast('Error checking certificate status. Please try again.', 'error');
            }
        };
    
        checkCertificateStatus();
    }, [id]);

    const handleRegistration = async () => {
        const token = sessionStorage.getItem('authToken');
        try {
            const response = await axios.post(
                'http://localhost:3000/u/events/',
                { eventId: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsRegistered(true); // User is now registered
            setRegistrationStatus("Cancel Registration"); // Change the button text to "Cancel Registration"
            showToast('Event added to your Google Calendar with reminders', 'success');
        } catch (err) {
            showToast('Failed to register for the event', 'error');
        }
    };
    const checkCertificateStatus = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await axios.get(
                `http://localhost:3000/u/events/${id}/certificate-status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.status === 'issued') {
                setCertificateStatus('issued');
                showToast('Your certificate is ready!', 'success');
            } else {
                setTimeout(checkCertificateStatus, 10000);
            }
        } catch (error) {
            console.error('Error checking certificate status:', error);
            showToast('Error checking certificate status. Please try again.', 'error');
        }
    };

    const handleCancellation = async () => {
        const token = sessionStorage.getItem('authToken');
        try {
            if (!googleEventId) {
                showToast('No Google Calendar event found to cancel.', 'error');
                return;
            }
            await axios.delete(
                `http://localhost:3000/u/events/${id}/cancellation`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { googleEventId: googleEventId },
                }
            );

            setIsRegistered(false);
            setRegistrationStatus("Register");
            showToast('Registration and calendar event cancelled successfully', 'success');
        } catch (error) {
            console.error('Cancellation error:', error);
            showToast(
                'Failed to cancel registration: ' + (error.response?.data?.message || error.message),
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return <p>Loading event...</p>;
    if (error) return <p>{error}</p>;
    if (!event) return <p>Event not found.</p>;

    return (
        <div className="event-details-card">
            {/* Background circle */}
            <div className="container eventDetail">

                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <div className="user-event-details" key={event._id || event.id} style={{ contentAlign: 'center', margin: '0 auto' }}>

                    <h3><strong>{event.title}</strong></h3>
                    <img
                        src={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                        alt={event.title}
                        className="event-details-image"
                        onClick={() => setShowImage(true)} // Show overlay on click
                        onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')}
                    />
                    <div className='college-department' style={{  backgroundColor: event.participantGroup?.college ? event.color : '#9e1414' }}>
                        <p>{event.participantGroup?.college || 'Exclusive'}</p>
                    </div>
                    {showImage && ( // Overlay div
                        <div className="event-image-overlay" onClick={() => setShowImage(false)}>
                            <img
                                src={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                                alt={event.title}
                                className="large-image"
                                onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')}
                            />
                        </div>
                    )}
                    <div className='information'>
                        <div className='left-details'>
                            <div className="user-register-button" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {canRegister ? (
                                    isEventActive ? (
                                        <button className='register-button' onClick={isRegistered ? handleCancellation : handleRegistration}>
                                            {registrationStatus}
                                        </button>
                                    ) : (
                                        isEventCompleted() ? (
                                            // Show form section if event is completed
                                            <div className="post-event-section">
                                                {canAccessForm() && (
                                                    <div>
                                                        <h4>Event Survey</h4>
                                                        <p>Please complete the survey to receive your certificate.</p>
                                                        <div className="form-link-container">
                                                            <a
                                                                href={event.formLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="form-link"
                                                                onClick={handleFormLinkClick}
                                                            >
                                                                Survey Form
                                                            </a>

                                                            {submissionStatus !== 'idle' && (
                                                                <div className={`submission-status ${submissionStatus}`}>
                                                                    {isLoading && <div className="loading-spinner"></div>}
                                                                    <p>{submissionMessage}</p>
                                                                    {submissionStatus === 'waiting' && (
                                                                        <>
                                                                            <p className="submission-instructions">
                                                                                Important:
                                                                                <ul>
                                                                                    <li>Use your registered email ({currentUser?.email})</li>
                                                                                    <li>Complete and submit the form</li>
                                                                                    <li>Click "Verify Submission" after submitting</li>
                                                                                </ul>
                                                                            </p>
                                                                            <VerifySubmissionButton />
                                                                        </>
                                                                    )}
                                                                    {submissionStatus === 'error' && (
                                                                        <button
                                                                            onClick={handleFormSubmission}
                                                                            disabled={isLoading}
                                                                            className="verify-submission-btn"
                                                                        >
                                                                            Try Verifying Again
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {!hasSubmittedForm && (
                                                    <div className='msg'>
                                                        <p>Please submit the form to receive your certificate.</p>
                                                    </div>
                                                    
                                                )}

                                                {/* Certificate Section */}
                                                {hasSubmittedForm && (
                                                    <div className="certificate-section">
                                                        <h4>Certificate Status</h4>
                                                        {certificateStatus === 'generated' ? (
                                                            <>
                                                                <p>Your certificate is ready!</p>
                                                                <button
                                                                    className="download-certificate-button"
                                                                    onClick={downloadCertificate}
                                                                >
                                                                    Download Certificate
                                                                </button>
                                                            </>
                                                        ) : formStatus?.status === 'approved' ? (
                                                            <p>Your certificate is being generated...</p>
                                                        ) : (
                                                            <p>Your form submission is pending approval. Certificate will be available after approval.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p>Event has already started.</p>
                                        )
                                    )
                                ) : (
                                    <p>You are not eligible for this event.</p>
                                )}
                            </div>
                            <div className='event-details-section'>
                                <h6 className="event-date"><i className="fas fa-calendar-alt" style={{ color: `#FFB800` }}></i>  <strong>{new Date(event.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong></h6>
                                <h6 className="event-time"><i className="fas fa-clock" style={{ color: `#FFB800` }}></i><strong>{formatTime(event.startTime)} - {formatTime(event.endTime)}</strong></h6>
                                <h6 className="event-location"><i className="fas fa-map-marker-alt" style={{ color: `#FFB800` }}></i>  <strong>{event.location}</strong></h6>
                            </div>
                        </div>
                        <div className='right-details'>
                            <h6 className="event-description">{event.description}</h6>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Event;