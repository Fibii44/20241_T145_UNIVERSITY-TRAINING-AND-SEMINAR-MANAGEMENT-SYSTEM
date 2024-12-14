import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";   
import { faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";   
import "../historyList/history.css";

function userHistoryList() {
  const [events, setEvents] = useState([]);
  const [sortBy, setSortBy] = useState({ field: 'date', direction: 'asc' });
  const [columns, setColumns] = useState({
    Upcoming: {
      id: "Upcoming",
      items: [],
    },
    "On Going": {
      id: "On Going",
      items: [],
    },
    Completed: {
      id: "Completed",
      items: [],
    },
  });

useEffect(() => {
    const fetchEvents = async () => {
        try {
            const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

            const response = await axios.get('http://localhost:3000/u/history', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const fetchedEvents = Array.isArray(response.data) ? response.data : [];
            setEvents(fetchedEvents);
        } catch (err) {
            console.error('Failed to fetch events', err);
            setEvents([]); // Default to an empty array on failure
        }
    };

    fetchEvents();
}, []);
  
useEffect(() => {
  const updateColumns = () => {
      const now = new Date(); // Current date and time
      const newColumns = {
          Upcoming: { id: 'Upcoming', items: [] },
          'On Going': { id: 'On Going', items: [] },
          Completed: { id: 'Completed', items: [] },
      };

      events.forEach(event => {
          // Log raw event data
          console.log("Raw event data:", {
              eventDate: event.eventDate,
              startTime: event.startTime,
              endTime: event.endTime,
          });

          // Parse `eventDate`, `startTime`, and `endTime`
          const eventStartTime = new Date(event.startTime); // ISO date-time string
          const eventEndTime = new Date(event.endTime); // ISO date-time string

          // Log the parsed dates
          console.log("Parsed Event Times:", {
              eventStartTime,
              eventEndTime,
              now,
          });

          // Categorize events
          if (now < eventStartTime) {
              // Event is in the future
              newColumns.Upcoming.items.push(event);
          } else if (now >= eventStartTime && now <= eventEndTime) {
              // Event is currently ongoing
              newColumns['On Going'].items.push(event);
          } else if (now > eventEndTime) {
              // Event has finished
              newColumns.Completed.items.push(event);
          }
      });

      console.log("Updated columns:", newColumns); // Debugging
      setColumns(newColumns);
  };

  updateColumns();
}, [events]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy.field === 'date') {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      return sortBy.direction === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy.field === 'title') {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return sortBy.direction === 'asc'
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA);
    }
  });

  return (
    <div className="userHistory-container card">

      <div className="kanban-board">
        {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="kanban-column">
                <h4 className="column-header">{columnId}</h4>
                {column.items.length > 0 ? (
                    column.items.map(event => (
                        <div key={event._id} className="kanban-item">
                          <Link to={`/u/events/${event._id}`} key={event._id} className="event-link">
                            <div className="kanban-item-content">
                                <div className="image-column">
                                    <img
                                        src={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                                        alt={event.title}
                                        className="list-view-image"
                                        onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')}
                                    />
                                </div>
                                <div className="event-details">
                                    <h5 style={{ color: '#011c39' }}>{event.title}</h5>
                                    <p className="event-location">Location: {event.location}</p>
                                    <p className="event-time">Time: {formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                                    <p className='date'>Date: {new Date(event.eventDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}</p>
                                </div>
                            </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p style={{marginLeft: '1rem'}}>No events in this category.</p>
                )}
            </div>
))}

        
      </div>
    </div>
  );
}

export default userHistoryList;