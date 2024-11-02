const { google } = require('googleapis');
const moment = require('moment-timezone');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const generateAuthUrl = () => oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Forces re-consent and refresh token generation if missing
    scope: ['https://www.googleapis.com/auth/calendar.events'],
});

const setCredentials = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    return tokens; 
};

const createEvent = async (eventData, tokens) => {
    oauth2Client.setCredentials(tokens);  // Set credentials here with the tokens passed
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { summary, date, startTime, endTime } = eventData;

    const start = moment.tz(`${date}T${startTime}`, "Asia/Manila").format();
    const end = moment.tz(`${date}T${endTime}`, "Asia/Manila").format();

    const event = {
        summary,
        description: "Event Created by CITL",
        start: { dateTime: start, timeZone: "Asia/Manila" },
        end: { dateTime: end, timeZone: "Asia/Manila" },
        reminders: {
            useDefault: false,
            overrides: [
                { method: "email", minutes: 1440 },
                { method: "popup", minutes: 10 }
            ],
        },
    };
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);
    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });
        return response.data;
    } catch (error) {
        console.error('Error creating event:', error.message);
        throw new Error('Failed to create event. Check authentication tokens and Google API configuration.');
    }
};


module.exports = { generateAuthUrl, setCredentials, createEvent };