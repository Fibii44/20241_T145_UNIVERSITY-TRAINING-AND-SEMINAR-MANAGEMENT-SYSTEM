import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Calendar = () => {
    const [events, setEvents] = useState([]);

    const handleLogin = () => {
        window.open('http://localhost:5000/auth/google', '_self');
    };

    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/calendar', { withCredentials: true });
            setEvents(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error('User not authorized. Please log in.');
                // Optionally redirect to login or display a message
            } else {
                console.error('Error fetching events', error);
            }
        }
    };

    useEffect(() => {
        if (events.length === 0) {
            fetchEvents(); // Fetch events only if not already fetched
        }
    }, [events]);

    return (
        <div>
            <h1>Google Calendar Events</h1>
            <button onClick={handleLogin}>Login with Goggles</button>
            <ul>
                {events.map(event => (
                    <li key={event.id}>
                        {event.summary} - {new Date(event.start.dateTime).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Calendar;