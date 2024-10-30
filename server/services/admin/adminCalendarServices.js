// services/googleCalendarService.js
const { google } = require('googleapis');
const moment = require('moment-timezone');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const generateAuthUrl = () => oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
});

const setCredentials = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
};

const createEvent = async (eventData) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { summary, date, startTime, endTime } = eventData;

    const start = moment.tz(`${date}T${startTime}`, "Asia/Manila").format();
    const end = moment.tz(`${date}T${endTime}`, "Asia/Manila").format();

    const event = {
        summary,
        description: "Event Created by CITL",
        start: { dateTime: start, timeZone: "Asia/Manila" },
        end: { dateTime: end, timeZone: "Asia/Manila" },
        reminders: { useDefault: false, overrides: [{ method: "email", minutes: 1440 }, { method: "popup", minutes: 10 }] },
    };

    try {
        const response = await calendar.events.insert({ calendarId: 'primary', resource: event });
        return response.data; // Return response data
    } catch (error) {
        console.error('Error creating event:', error.message); // Log error message
        throw new Error('Failed to create event. Check the server logs for details.');
    }
};

module.exports = { generateAuthUrl, setCredentials, createEvent };
