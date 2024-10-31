import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error("No authentication token found");

                const response = await axios.get('http://localhost:3000/auth/calendar/events', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setEvents(response.data.items);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        if (isAuthenticated) {
            fetchEvents();
        }
    }, [isAuthenticated]);

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3000/auth/google';
    };

    return (
        <div className="calendar">
            {!isAuthenticated ? (
                <button onClick={handleGoogleLogin}>Sign in with Google</button>
            ) : (
                <div>
                    <h2>Your Google Calendar Events</h2>
                    <ul>
                        {events.map((event) => (
                            <li key={event.id}>
                                <strong>{event.summary}</strong>
                                <p>{new Date(event.start.dateTime || event.start.date).toLocaleString()}</p>
                                <p>{event.location}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Calendar;