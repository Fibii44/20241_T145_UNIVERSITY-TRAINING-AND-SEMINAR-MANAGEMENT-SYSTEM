import React, { useState } from 'react';
import axios from 'axios';

const Calendar = () => {
    const [summary, setSummary] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const createEvent = async () => {
        console.log('Create event function called'); // Debugging line
        try {
            const response = await axios.post('http://localhost:3000/api/events', {
                summary,
                date,
                startTime,
                endTime,
            });
            alert(response.data);
        } catch (error) {
            console.error('Error creating event:', error); // Log the entire error object
            alert('Error creating event: ' + (error.response ? error.response.data : error.message));
        }
    };
    
    return (
        <div style={{ padding: '20px' }}>
            <h1>Create Event</h1>
            <input
                type="text"
                placeholder="Event Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
            />
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
            />
            <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
            />
            <button onClick={createEvent}>Create Event</button>
            <a href="http://localhost:3000/auth/google">Authenticate with Google</a>
        </div>
    );
};

export default Calendar;
