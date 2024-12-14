    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
    import React, { useState, useEffect } from 'react';
    import './calendar.css';
    import axios from 'axios';
    import { Link } from 'react-router-dom';
    import { jwtDecode } from 'jwt-decode';

    const Calendar = () => {
        const [calendarWidth, setCalendarWidth] = useState(75); // Width in percentage
        const [isResizing, setIsResizing] = useState(false);
        const [events, setEvents] = useState([]);
        const [user, setUser] = useState({ name: '', profilePicture: '', role: '', id: '' });
        const [registeredEvents, setRegisteredEvents] = useState([]);
        const [currentView, setCurrentView] = useState('month');
        const [currentDate, setCurrentDate] = useState(new Date());
        const [showOverlay, setShowOverlay] = useState(false);
        const [selectedEvents, setSelectedEvents] = useState([]);
        const [selectedDate, setSelectedDate] = useState(null);
        const [selectedCollege, setSelectedCollege] = useState('');
        const today = new Date();
        const loggedInUserId = user.id;
        const colleges = [
                            'Registered Events','College of Arts and Sciences', 'College of Business', 'College of Education',
                            'College of Law', 'College of Public Administration and Governance', 
                            'College of Nursing', 'College of Technologies'
                         ];
                         
                        // Function to open the overlay for a selected day
        const openOverlay = (date, events) => {
            setSelectedDate(date);
            setSelectedEvents(events);
            setShowOverlay(true);
        };
        
        const closeOverlay = () => {
            setShowOverlay(false);
        };
    
        // Format a Date object as a 12-hour time string
        const formatTime = (date) => {
            return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        };
        const handleMouseDown = () => {
            setIsResizing(true);
        };
    
        const handleMouseMove = (e) => {
            if (!isResizing) return;
    
            // Calculate new width based on mouse position
            const newWidth = (e.clientX / window.innerWidth) * 100;
            if (newWidth > 20 && newWidth < 80) { // Restrict width between 20% and 80%
                setCalendarWidth(newWidth);
            }
        };
    
        const handleMouseUp = () => {
            setIsResizing(false);
        };
    
        useEffect(() => {
            if (isResizing) {
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
            } else {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            }
    
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }, [isResizing]);
    
        useEffect(() => {
            const fetchEvents = async () => {
                try {
                    const response = await axios.get('http://localhost:3000/u/events');
                    console.log('Fetched events:', response.data);
                    setEvents(response.data);
                } catch (error) {
                    console.error('Error fetching events:', error);
                }
            };
        
            fetchEvents();
        }, []);
    
        useEffect(() => {
            const token = sessionStorage.getItem('authToken');
            if (token) {
                const decoded = jwtDecode(token);
                setUser({
                    name: decoded.name,
                    email: decoded.email,
                    profilePicture: decoded.profilePicture,
                    role: decoded.role,
                    id: decoded.id
                });
            }
        }, []);
    
        useEffect(() => {
            const fetchRegisteredEvents = async () => {
                try {
                    const response = await axios.get('http://localhost:3000/u/calendar');
                    console.log('Fetched registered events:', response.data); // Debugging
                    setRegisteredEvents(response.data);
                } catch (error) {
                    console.error('Error fetching registered events:', error);
                }
            };
            fetchRegisteredEvents();
        }, []);
        

        function hexToRgb(hex) {
            hex = hex.replace('#', '');
            let r = parseInt(hex.substring(0, 2), 16);
            let g = parseInt(hex.substring(2, 4), 16);
            let b = parseInt(hex.substring(4, 6), 16);
            
            return `${r}, ${g}, ${b}`;
        }
    
        const upcomingEvents = events
            .filter(event => new Date(event.eventDate) >= today) // Ensure events are today or in the future
            .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)) // Sort by date ascending
            .slice(0, 5); // Limit to the first 5 upcoming events

    
        const renderUpcomingEvents = () => (
            <div className="upcoming-events">
                <h3>Upcoming Events</h3>
                <ul>
                    {upcomingEvents.map(event => (
                        <li key={event._id} style={{ borderLeft: `5px solid ${event.color}`, paddingLeft: '8px', marginBottom: '10px' }}>
                            <strong>{event.title}</strong>
                            <br />
                            <small>
                                {new Date(event.eventDate).toLocaleDateString()} | {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </small>
                        </li>
                    ))}
                </ul>
                <div className='legends'>
                    <div className='legend-container'>
                        <p>Legends</p>
                        <div className='legend' >
                            <div className='legend-dot' style={{ backgroundColor: `#72f7b0` }}></div>
                            <small>College of Arts and Sciences</small>
                        </div>
                        <div className='legend' >
                            <div className='legend-dot' style={{ backgroundColor: `#fff45e` }}></div>
                            <small>College of Business</small>
                        </div>
                        <div className='legend' >
                            <div className='legend-dot' style={{ backgroundColor: `#727bf7` }}></div>
                            <small>College of Education</small>
                        </div>
                        <div className='legend' >
                            <div className='legend-dot' style={{ backgroundColor: `#ae72f7` }}></div>
                            <small>College of Law</small>
                        </div>
                        <div className='legend' >
                            <div className='legend-dot' style={{ backgroundColor: `#f772b0` }}></div>
                            <small>College of Nursing</small>
                        </div>
                        <div className='legend' >
                            <div className='legend-dot' style={{ backgroundColor: `#442859` }}></div>
                            <small>College of Public Administration and Governance</small>
                        </div>
                        <div className='legend' >
                            <div className='legend-dot' style={{ backgroundColor: `#f78f72` }}></div>
                            <small>College of Technologies</small>
                        </div>
                        <div className='legend' >
                            <div className='legend-dot' style={{ backgroundColor: `#65a8ff` }}></div>
                            <small>Default</small>
                        </div>
                    </div>
                </div>
            </div>
        );
    
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
        const getEventsForDay = (date) => {
            return events.filter(event => {
                const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
                return eventDate === date;
            });
        };
    
        const renderViewButtons = () => (
            <div style={{ display: 'flex' }}>
                <button className={`button ${currentView === 'day' ? 'active' : ''}`} onClick={() => setCurrentView('day')}>Day</button>
                <button className={`button ${currentView === 'week' ? 'active' : ''}`} onClick={() => setCurrentView('week')}>Week</button>
                <button className={`button ${currentView === 'month' ? 'active' : ''}`} onClick={() => setCurrentView('month')}>Month</button>
                <button className={`button ${currentView === 'year' ? 'active' : ''}`} onClick={() => setCurrentView('year')}>Year</button>
            </div>
        );
    
        const goToPrevious = () => {
            switch (currentView) {
                case 'day':
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
                    break;
                case 'week':
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
                    break;
                case 'month':
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
                    break;
                case 'year':
                    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
                    break;
                default:
                    break;
            }
        };
    
        const goToNext = () => {
            switch (currentView) {
                case 'day':
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
                    break;
                case 'week':
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
                    break;
                case 'month':
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
                    break;
                case 'year':
                    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
                    break;
                default:
                    break;
            }
        };
        const filterEventsByCollege = (events) => {
            if (selectedCollege === 'Registered Events') {
                return events.filter(event =>
                    registeredEvents.some(registration =>
                        registration.eventId === event._id && registration.userId === loggedInUserId
                    )
                );
            }
        
            if (selectedCollege) {
                return events.filter(event => {
                    if (!event.participantGroup) return false;
                    return event.participantGroup.college === selectedCollege;
                });
            }
        
            return events; // Default: Return all events if no filter is selected
        };

        const filteredEvents = filterEventsByCollege(events);
const renderMonthView = () => {
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            const daysInMonth = endOfMonth.getDate();
            const firstDayOfWeek = startOfMonth.getDay();
        
            const daysFromPrevMonth = Array.from(
                { length: firstDayOfWeek },
                (_, i) => new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), i - firstDayOfWeek + 1)
            );
        
            const daysThisMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), i + 1));
            const totalDaysInCalendar = daysFromPrevMonth.length + daysThisMonth.length;
            const daysFromNextMonthCount = totalDaysInCalendar < 42 ? 42 - totalDaysInCalendar : 0;
            const daysFromNextMonth = Array.from(
                { length: daysFromNextMonthCount },
                (_, i) => new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, i + 1)
            );
        
            const allDays = [...daysFromPrevMonth, ...daysThisMonth, ...daysFromNextMonth];

            
            
            console.log('Logged-in User ID:', loggedInUserId);
            console.log('Registered Events:', registeredEvents);
            console.log('Filtered Events:', filteredEvents);
            return (
                <>
                    <div className="calendar-header">
                        <button className="prev-next" onClick={goToPrevious}><FontAwesomeIcon icon={faChevronLeft} /></button>
                        <h2>{startOfMonth.toLocaleString('default', { month: 'long' })} {startOfMonth.getFullYear()}</h2>
                        <button className="prev-next" onClick={goToNext}><FontAwesomeIcon icon={faChevronRight} /></button>
                        {renderViewButtons()}
                        <select
                            value={selectedCollege}
                            onChange={(e) => setSelectedCollege(e.target.value)} 
                            className="college-filter-dropdown"
                        >
                            <option value="">All Events</option>
                            {colleges.map(college => (
                                <option key={college} value={college}>{college}</option>
                            ))}
                        </select>
                    </div>
                    <div className="calendar-grid">
                        {daysOfWeek.map(day => (
                            <div key={day} className="calendar-day-header">{day}</div>
                        ))}
                        {allDays.map((date, index) => {
                            // Convert to locale date to avoid timezone issues
                            const formattedDate = date.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
                            const dayNumber = date.getDate();
                            const eventsForDay = filteredEvents.filter(event => {
                            const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
                                return eventDate === formattedDate;
                            });
                        const isToday = date.toDateString() === today.toDateString();
    
                            return (
                                <div
                                    key={index}
                                    className="calendar-day"
                                    style={isToday ? { border: '2px solid blue' } : {}}
                                    onClick={() => openOverlay(formattedDate, eventsForDay)}
                                >
                                    <div className="date-number" style={{ opacity: date.getMonth() !== currentDate.getMonth() ? 0.5 : 1 }}>
                                        {dayNumber}
                                    </div>
                                    <div className="events-for-day grid-container">
                                        {eventsForDay.map(event => (
                                            <Link to={`/u/events/${event._id}`} key={event._id} className="event-link">
                                                <div 
                                                    className="event grid-item" 
                                                    style={{ backgroundColor: event.color }}
                                                >
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );                       
                        })}
                    </div>
                    {showOverlay && (
                        <div className="calendar-overlay">
                            <div className="overlay-content">
                                <div className='overlay-header'>
                                    <h2>{startOfMonth.toLocaleString('default', { month: 'long' })} {startOfMonth.getFullYear()}</h2>
                                    <button onClick={closeOverlay} className="close-button">Close</button>
                                </div>
                                <div className="events-list">
                                    {selectedEvents.length > 0 ? (
                                        selectedEvents.map(event => (
                                            <div key={event._id} className="event-detail" 
                                            style={{ 
                                                backgroundColor: `rgba(${hexToRgb(event.color)}, 0.25)`,
                                                borderLeft: `5px solid ${event.color}`,
                                            }}
                                            >
                                                <span 
                                                    style={{ 
                                                        color: event.color,
                                                        fontWeight: 'bold', 
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                {event.title}
                                            </span>
                                                <p>{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No events for this day.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
            };
        
        // Week View
        const renderWeekView = () => {
    
            const startOfWeek = new Date(currentDate);
            const dayOfWeek = startOfWeek.getDay();
            startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
        
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
        
            const weekHeader = startOfWeek.getMonth() === endOfWeek.getMonth() 
                ? `${startOfWeek.toLocaleString('default', { month: 'long' })} ${startOfWeek.getDate()}, ${startOfWeek.getFullYear()}` 
                : `${startOfWeek.toLocaleString('default', { month: 'long' })} ${startOfWeek.getDate()} - ${endOfWeek.toLocaleString('default', { month: 'long' })} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
                
    
                const filterEventsByCollege = (events) => {
                    if (!selectedCollege) return events; // If no college is selected, show all events
                
                    return events.filter(event => {
                        if (!event.participantGroup) {
                            console.warn("Event missing participantGroup:", event);
                            return false;
                        }
                        return event.participantGroup.college === selectedCollege;
                    });
                };
                console.log('Logged-in User ID:', loggedInUserId);
                console.log('Registered Events:', registeredEvents);
                console.log('Filtered Events:', filteredEvents);
            return (
                <>
                    <div className="calendar-header">
                        <button className="prev-next" onClick={goToPrevious}><FontAwesomeIcon icon={faChevronLeft} /></button>
                        <h2>{weekHeader}</h2>
                        <button className="prev-next" onClick={goToNext}><FontAwesomeIcon icon={faChevronRight} /></button>
                        {renderViewButtons()}
                        <select
                            value={selectedCollege}
                            onChange={(e) => setSelectedCollege(e.target.value)}
                            className="college-filter-dropdown"
                            >
                            <option value="">All Events</option>
                            {colleges.map(college => (
                                <option key={college} value={college}>{college}</option>
                            ))}
                        </select>
                    </div>
                    <div className="calendar-grid">
                        {daysOfWeek.map(day => (
                            <div key={day} className="calendar-day-header">{day}</div>
                        ))}
                        {Array.from({ length: 7 }, (_, index) => {
                            const date = new Date(startOfWeek);
                            date.setDate(startOfWeek.getDate() + index);
                            const formattedDate = date.toISOString().split('T')[0];
                            const dayNumber = date.getDate();
                            const eventsForDay = filteredEvents.filter(event => {
                                const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
                                    return eventDate === formattedDate;
                                });
                            const isToday = date.toDateString() === today.toDateString();
                            
                            return (
                                <div
                                    key={index}
                                    className="calendar-day"
                                    style={isToday ? { border: '2px solid' } : {}}
                                    onClick={() => openOverlay(formattedDate, eventsForDay)}
                                >
                                    <div className="date-number" style={{ opacity: date.getMonth() !== currentDate.getMonth() ? 0.5 : 1 }}>
                                        {dayNumber}
                                    </div>
                                    <div className="events-for-day grid-container">
                                        {eventsForDay.map(event => (
                                            <Link to={`/u/events/${event._id}`} key={event._id} className="event-link">
                                                <div 
                                                    className="event grid-item" 
                                                    style={{ backgroundColor: event.color }}
                                                >
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {showOverlay && (
                        <div className="calendar-overlay">
                            <div className="overlay-content">
                                <div className='overlay-header'>
                                <h2>{weekHeader}</h2>
                                    <button onClick={closeOverlay} className="close-button">Close</button>
                                </div>
                                <div className="events-list">
                                    {selectedEvents.length > 0 ? (
                                        selectedEvents.map(event => (
                                            <div key={event._id} className="event-detail" 
                                            style={{ 
                                                backgroundColor: `rgba(${hexToRgb(event.color)}, 0.25)`,
                                                borderLeft: `5px solid ${event.color}`,
                                                
                                            }}
                                            >
                                                <span 
                                                    style={{ 
                                                        color: event.color,    // Keep title color fully opaque
                                                        fontWeight: 'bold', 
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                {event.title}
                                            </span>
                                                
                                            <p>{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No events for this day.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
        };
       // Year View
        const renderYearView = () => {
            const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
    
            return (
            <>
                <div className="calendar-header">
                    <button className="prev-next" onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1))}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <h2>{currentDate.getFullYear()}</h2>
                    <button className="prev-next" onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    {renderViewButtons()}
                    <select
                            value={selectedCollege}
                            onChange={(e) => setSelectedCollege(e.target.value)}
                            className="college-filter-dropdown"
                            >
                            <option value="">All Events</option>
                            {colleges.map(college => (
                                <option key={college} value={college}>{college}</option>
                            ))}
                        </select>
                </div>
                <div className="year-view">
                    {months.map((month, monthIndex) => {
                        // Get the first day of the month and the number of days in the month
                        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
                        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
                        const daysInMonth = endOfMonth.getDate();
                        const firstDayOfWeek = startOfMonth.getDay();
    
                        // Days from the previous month to fill the first week of the calendar
                        const daysFromPrevMonth = Array.from(
                            { length: firstDayOfWeek },
                            (_, i) => new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), i - firstDayOfWeek + 1)
                        );  
    
                        // Days in the current month
                        const daysThisMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), i + 1));
    
                        // Calculate days needed from the next month to fill the 42-day grid
                        const totalDaysInCalendar = daysFromPrevMonth.length + daysThisMonth.length;
                        const daysFromNextMonthCount = totalDaysInCalendar < 42 ? 42 - totalDaysInCalendar : 0;
                        const daysFromNextMonth = Array.from(
                            { length: daysFromNextMonthCount },
                            (_, i) => new Date(endOfMonth.getFullYear(), endOfMonth.getMonth() + 1, i + 1)
                        );
    
                        const allDays = [...daysFromPrevMonth, ...daysThisMonth, ...daysFromNextMonth];
    
                        return (
                            <div key={monthIndex} className="month">
                                <h3>{month.toLocaleString('default', { month: 'long' })}</h3>
                                <div className="month-grid">
                                    {daysOfWeek.map(day => (
                                        <div key={day} className="year-calendar-day-header">{day}</div>
                                    ))}
                                    {allDays.map((date, dayIndex) => {
                                        const formattedDate = date.toISOString().split('T')[0];
                                        const isToday = date.toDateString() === today.toDateString();
                                        const isCurrentMonth = date.getMonth() === month.getMonth();
                                        const eventsForDay = filteredEvents.filter(event => {
                                            const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
                                                return eventDate === formattedDate;
                                            });
    
                                        return (
                                            <div 
                                                key={dayIndex} 
                                                className="year-calendar-day" 
                                                style={{
                                                    opacity: isCurrentMonth ? 1 : 0.3,
                                                    border: isToday ? '2px solid blue' : 'none'
                                                }}
                                            >
                                                <div className="date-number">{date.getDate()}</div>
                                                {isCurrentMonth && eventsForDay.map(event => (
                                                    <div key={event._id} className="event" style={{ backgroundColor: event.color }}>
                                                        {event.title}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    };
        
        // Day View =========================================================================================================================================================================
        const renderDayView = () => {
            const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
            const selectedDay = selectedDate ? new Date(selectedDate) : today;
            const eventsForSelectedDay = getEventsForDay(selectedDay.toLocaleDateString('en-CA'));
        
            return (
                <>
                    {/* Calendar Header */}
                    <div className="calendar-header">
                        <button className="prev-next" onClick={goToPrevious}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <h2>
                            {selectedDay.toLocaleDateString('default', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </h2>
                        <button className="prev-next" onClick={goToNext}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                        {renderViewButtons()}
                        <select
                            value={selectedCollege}
                            onChange={(e) => setSelectedCollege(e.target.value)}
                            className="college-filter-dropdown"
                        >
                            <option value="">All Events</option>
                            {colleges.map((college) => (
                                <option key={college} value={college}>
                                    {college}
                                </option>
                            ))}
                        </select>
                    </div>
        
                    {/* Day View Section */}
                    <div className="day-view">
                        {eventsForSelectedDay.length > 0 ? (
                            <div className="events-list">
                                {eventsForSelectedDay.map((event) => (
                                    <div
                                        key={event._id}
                                        className="event-detail"
                                        style={{
                                            backgroundColor: `rgba(${hexToRgb(event.color)}, 0.25)`,
                                            borderLeft: `5px solid ${event.color}`,
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: event.color,
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                            }}
                                        >
                                            {event.title}
                                        </span>
                                        <p>{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No events for this day.</p>
                        )}
                    </div>
        
                    {/* Overlay Section */}
                    {showOverlay && (
                        <div className="calendar-overlay">
                            <div className="overlay-content">
                                <div className="overlay-header">
                                    <h2>
                                        {selectedDay.toLocaleDateString('default', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </h2>
                                    <button onClick={closeOverlay} className="close-button">
                                        Close
                                    </button>
                                </div>
                                <div className="events-list">
                                    {selectedEvents.length > 0 ? (
                                        selectedEvents.map((event) => (
                                            <div
                                                key={event._id}
                                                className="event-detail"
                                                style={{
                                                    backgroundColor: `rgba(${hexToRgb(event.color)}, 0.25)`,
                                                    borderLeft: `5px solid ${event.color}`,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: event.color,
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {event.title}
                                                </span>
                                                <p>{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No events for this day.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
        };
        
        const renderCalendar = () => {
            switch (currentView) {
                case 'day':
                    return renderDayView();
                case 'week':
                    return renderWeekView();
                case 'month':
                    return renderMonthView();
                case 'year':
                    return renderYearView();
                default:
                    return renderMonthView();
            }
        };
    
        return (
            <div className="calendar-container">
                {/* Calendar Section */}
                <div className="calendar-section" style={{ width: `${calendarWidth}%` }}>
                    {renderCalendar()}
                </div>
                <div
                className="divider"
                onMouseDown={handleMouseDown}
                />
                {/* Event List Sidebar */}
                <div className="event-list" style={{ width: `${100 - calendarWidth}%` }}>
                    {renderUpcomingEvents()}
                </div>
            </div>
        );
    };
    
    export default Calendar;
    