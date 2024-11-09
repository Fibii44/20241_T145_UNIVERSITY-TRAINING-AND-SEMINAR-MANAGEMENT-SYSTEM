// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Calendar = () => {
//     const [events, setEvents] = useState([]);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);

//     useEffect(() => {
//         const fetchEvents = async () => {
//             try {
//                 const token = localStorage.getItem('authToken');
//                 if (!token) throw new Error("No authentication token found");

//                 const response = await axios.get('http://localhost:3000/auth/calendar/events', {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });
//                 setEvents(response.data.items);
//             } catch (error) {
//                 console.error("Error fetching events:", error);
//             }
//         };

//         if (isAuthenticated) {
//             fetchEvents();
//         }
//     }, [isAuthenticated]);

//     const handleGoogleLogin = () => {
//         window.location.href = 'http://localhost:3000/auth/google';
//     };

//     return (
//         <div className="calendar">
//             {!isAuthenticated ? (
//                 <button onClick={handleGoogleLogin}>Sign in with Google</button>
//             ) : (
//                 <div>
//                     <h2>Your Google Calendar Events</h2>
//                     <ul>
//                         {events.map((event) => (
//                             <li key={event.id}>
//                                 <strong>{event.summary}</strong>
//                                 <p>{new Date(event.start.dateTime || event.start.date).toLocaleString()}</p>
//                                 <p>{event.location}</p>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Calendar;

//Ayaw i delete ang comment na codess
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import './calendar.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [currentView, setCurrentView] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showOverlay, setShowOverlay] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const today = new Date();

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

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:3000/a/events');
                console.log('Fetched events:', response.data);
                setEvents(response.data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
    
        fetchEvents();
    }, []);

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }

    const upcomingEvents = events
        .filter(event => new Date(event.eventDate) >= today)
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
        .slice(0, 5);

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

    const renderMonthView = () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = endOfMonth.getDate();
        const firstDayOfWeek = startOfMonth.getDay();
    
        const daysFromPrevMonth = Array.from(
            { length: firstDayOfWeek },
            (_, i) => new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), -(firstDayOfWeek - i))
        );
    
        const daysThisMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), i + 1));
        const totalDaysInCalendar = daysFromPrevMonth.length + daysThisMonth.length;
        const daysFromNextMonthCount = totalDaysInCalendar < 42 ? 42 - totalDaysInCalendar : 0;
        const daysFromNextMonth = Array.from(
            { length: daysFromNextMonthCount },
            (_, i) => new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, i + 1)
        );
    
        const allDays = [...daysFromPrevMonth, ...daysThisMonth, ...daysFromNextMonth];
    
        return (
            <>
                <div className="calendar-header">
                    <button className="prev-next" onClick={goToPrevious}><FontAwesomeIcon icon={faChevronLeft} /></button>
                    <h2>{startOfMonth.toLocaleString('default', { month: 'long' })} {startOfMonth.getFullYear()}</h2>
                    <button className="prev-next" onClick={goToNext}><FontAwesomeIcon icon={faChevronRight} /></button>
                    {renderViewButtons()}
                </div>
                <div className="calendar-grid">
                    {daysOfWeek.map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                    ))}
                    {allDays.map((date, index) => {
                        const formattedDate = date.toISOString().split('T')[0];
                        const dayNumber = date.getDate();
                        const eventsForDay = getEventsForDay(formattedDate);
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
            <div className="calendar-section">
                {renderCalendar()}
            </div>

            {/* Event List Sidebar */}
            <div className="event-list">
                {renderUpcomingEvents()}
            </div>
        </div>
    );
};

export default Calendar;
