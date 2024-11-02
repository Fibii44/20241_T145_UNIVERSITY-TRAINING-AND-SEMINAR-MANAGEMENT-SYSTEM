const express = require('express');
const { createEvent, setCredentials } = require('../../services/admin/adminCalendarServices');
const router = express.Router();

router.post('/events', async (req, res) => {
    try {
        let tokens = req.body.tokens;

        if (!tokens) {
            const authCode = req.body.authCode;
            if (!authCode) {
                return res.status(400).json({ error: 'Authorization code is required.' });
            }

            tokens = await setCredentials(authCode); // Use tokens from setCredentials
        }

        const eventResponse = await createEvent(req.body.eventDetails, tokens);
        res.status(200).json({ message: 'Event created!', data: eventResponse });
    } catch (error) {
        console.error('Error creating event:', error.message);
        res.status(500).json({ error: 'Failed to create event. Check authentication tokens.' });
    }
});

module.exports = router;