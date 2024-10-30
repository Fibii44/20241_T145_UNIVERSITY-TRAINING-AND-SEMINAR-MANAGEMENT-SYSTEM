// routes/eventRoutes.js
const express = require('express');
const { createEvent } = require('../../services/admin/adminCalendarServices');

const router = express.Router();

router.post('/events', async (req, res) => {
    console.log('Received request to create event:', req.body); // Log the incoming request
    const { summary, date, startTime, endTime } = req.body;
    if (!summary || !date || !startTime || !endTime) {
        return res.status(400).send('Summary, date, startTime, and endTime are required.');
    }

    try {
        await createEvent({ summary, date, startTime, endTime });
        res.status(200).send('Event created!');
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).send('Required Authorization!');
    }
});


module.exports = router;
