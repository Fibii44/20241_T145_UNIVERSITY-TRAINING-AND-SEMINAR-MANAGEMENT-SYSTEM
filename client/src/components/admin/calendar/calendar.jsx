import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import './calendar.css';
import axios from 'axios';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [currentView, setCurrentView] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();

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

    const upcomingEvents = events
        .filter(event => new Date(event.eventDate) >= today)
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
        .slice(0, 5); // Display the next 5 upcoming events

     const renderUpcomingEvents = () => (
        <div className="upcoming-events">
            <h3>Upcoming Events</h3>
                <ul>
                {upcomingEvents.map(event => (
                    <li key={event.id} style={{ borderLeft: `5px solid #61b6fc`, paddingLeft: '8px', marginBottom: '10px' }}>
                        <strong>{event.title}</strong>
                        <br />
                        <small>{new Date(event.eventDate).toLocaleDateString()} | {event.startTime} - {event.endTime}</small>
                    </li>
                ))}
            </ul>
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
    
    // Month View
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
                            <div key={index} className="calendar-day" style={isToday ? { border: '2px solid blue' } : {}}>
                                <div className="date-number" style={{ opacity: date.getMonth() !== currentDate.getMonth() ? 0.5 : 1 }}>
                                    {dayNumber}
                                </div>
                                {eventsForDay.map(event => (
                                    <div key={event.id} className="event" style={{ backgroundColor: "#61b6fc" }}>
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
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
            ? `Week of ${startOfWeek.toLocaleString('default', { month: 'long' })} ${startOfWeek.getDate()}, ${startOfWeek.getFullYear()}` 
            : `Week of ${startOfWeek.toLocaleString('default', { month: 'long' })} ${startOfWeek.getDate()} - ${endOfWeek.toLocaleString('default', { month: 'long' })} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
    
        return (
            <>
                <div className="calendar-header">
                    <button className="prev-next" onClick={goToPrevious}><FontAwesomeIcon icon={faChevronLeft} /></button>
                    <h2>{weekHeader}</h2>
                    <button className="prev-next" onClick={goToNext}><FontAwesomeIcon icon={faChevronRight} /></button>
                    {renderViewButtons()}
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
                        const eventsForDay = getEventsForDay(formattedDate);
                        const isToday = date.toDateString() === today.toDateString();
    
                        return (
                            <div key={index} className={`calendar-day ${isToday ? 'today' : ''}`}>
                                <div className="date-number">{dayNumber}</div>
                                {eventsForDay.map(event => (
                                    <div key={event.id} className="event" style={{ backgroundColor: "#61b6fc" }}>
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </>
        );
    };

  // Year View
    const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));
    const weeksInMonth = months.map(month => {
        const weeks = [];
        const startOfMonth = new Date(month);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0); 
        let week = [];

       
        for (let i = 0; i < startOfMonth.getDay(); i++) {
            const prevMonthDate = new Date(month.getFullYear(), month.getMonth(), -(startOfMonth.getDay() - i));
            week.push(prevMonthDate); 
        }

       
        for (let day = 1; day <= endOfMonth.getDate(); day++) {
            const date = new Date(month.getFullYear(), month.getMonth(), day);
            week.push(date);

      
            if (date.getDay() === 6) {
                weeks.push(week);
                week = [];
            }
        }

       
        const nextMonthStartDay = (7 - endOfMonth.getDay() - 1);
        for (let i = 1; i <= nextMonthStartDay; i++) {
            const nextMonthDate = new Date(month.getFullYear(), month.getMonth() + 1, i);
            week.push(nextMonthDate); 
        }

        
        if (week.length > 0) {
            weeks.push(week);
        }
        
        return weeks;
    });
    return (
        <>
            <div className="calendar-header">
                <h2>{currentDate.getFullYear()}</h2>
                {renderViewButtons()}
            </div>
            <div className="calendar-year-grid">
                {months.map((month, index) => (
                    <div key={index} className="calendar-month-year">
                        <div className="month-name">{month.toLocaleString('default', { month: 'long' })}</div>
                        <div className="week-headers-year">
                            {daysOfWeek.map(day => (
                                <div key={day} className="calendar-day-header-year">{day.charAt(0)}</div>
                            ))}
                        </div>
                        {weeksInMonth[index].map((week, weekIndex) => (
                            <div key={weekIndex} className="week-year">
                                {week.map((date, dateIndex) => {
                                    const formattedDate = date ? date.toISOString().split('T')[0] : null;
                                    const eventsForDay = date ? getEventsForDay(formattedDate) : [];
                                    
                                    return (
                                        <div key={dateIndex} className="calendar-day-year">
                                            <div className="date-number-year" style={{ opacity: date && date.getMonth() !== month.getMonth() ? 0.5 : 1 }}>
                                                {date ? date.getDate() : ''}
                                            </div>
                                            {eventsForDay.map(event => (
                                                <div key={event.id} className="event-year" style={{ backgroundColor: "#61b6fc" }}>
                                                    {event.title}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
    };
// Day View =========================================================================================================================================================================
const renderDayView = () => {
    const formattedDate = currentDate.toISOString().split('T')[0];
    const eventsForDay = getEventsForDay(formattedDate);

    // Helper function to format hour in 12-hour format with AM/PM
    const formatHour = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${formattedHour} ${period}`;
    };

    return (
        <>
            <div className="calendar-header">
                <h2>{currentDate.toLocaleDateString()}</h2>
                {renderViewButtons()}
            </div>
            <div className="day-view">
                {Array.from({ length: 24 }, (_, hour) => {
                    const eventsAtHour = eventsForDay.filter(event => new Date(event.eventDate).getHours() === hour);
                    return (
                        <div key={hour} className="hour-block">
                            <div className="hour-label">{formatHour(hour)}</div>
                            <div className="events">
                                {eventsAtHour.length > 0 ? eventsAtHour.map(event => (
                                    <div key={event.id} className="event" style={{ backgroundColor: "#61b6fc" }}>
                                        {event.title}
                                    </div>
                                )) : <div className="no-events"></div>}
                            </div>
                        </div>
                    );
                })}
            </div>
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

     // Event List Component

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


