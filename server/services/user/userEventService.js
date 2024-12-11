const { google } = require('googleapis');
const Event = require('../../models/event');
const User = require('../../models/user');
const Registration = require('../../models/registration');
const { emitNewActivity } = require('../../config/socketConfig')

// Replace with model

// List all available events
const listEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).send('Error retrieving events');
    }
};

// View a specific event by ID
const viewEvent = async (req, res) => {
    try {
        console.log("Viewing event with ID:", req.params.id);
        const event = await Event.findById(req.params.id);
        console.log("Event found:", event);
        
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.status(200).json(event); // Set the status before sending the response
    } catch (error) {
        res.status(500).send('Error retrieving event');
    }
};


// Handle registration and attendance
const registration = async (req, res) => {
    // Logic for event registration and attendance
    const eventId = req.body.eventId;
    const userId = req.user.id; // Assuming you have user authentication in place
    const token = req.user.accessToken;

    console.log("eventId", eventId);
    console.log("userId", userId);
    console.log("token", token)

    const GOOGLE_CALENDAR_COLORS = {
        '1': '#7986cb',  // Lavender
        '2': '#33b679',  // Green
        '3': '#8e24aa',  // Purple
        '4': '#e67c73',  // Red
        '5': '#f6bf26',  // Yellow
        '6': '#f4511e',  // Orange
        '7': '#039be5',  // Turquoise
        '8': '#616161',  // Gray
        '9': '#3f51b5',  // Bold Blue
        '10': '#0b8043', // Bold Green
        '11': '#d50000'  // Bold Red
      };
      
      // Function to find the closest matching Google Calendar colorId
      const findClosestColorId = (hexColor) => {
        if (!hexColor) return '1'; // Default to blue if no color provided
        
        // Remove # if present
        const hex = hexColor.replace('#', '');
        
        // Convert hex to RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Find closest match
        let closestColorId = '1';
        let minDistance = Infinity;
        
        Object.entries(GOOGLE_CALENDAR_COLORS).forEach(([colorId, googleHex]) => {
          const googleRGB = {
            r: parseInt(googleHex.substring(1, 3), 16),
            g: parseInt(googleHex.substring(3, 5), 16),
            b: parseInt(googleHex.substring(5, 7), 16)
          };
          
          // Calculate color distance using simple RGB distance
          const distance = Math.sqrt(
            Math.pow(r - googleRGB.r, 2) +
            Math.pow(g - googleRGB.g, 2) +
            Math.pow(b - googleRGB.b, 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            closestColorId = colorId;
          }
        });
        
        return closestColorId;
      };
      

    const checkAuth = async (auth) => {
        console.log("Current auth state:", auth?.credentials); // Debug log
        if (!auth?.credentials?.access_token) {
            throw new Error("No valid authentication token found");
        }
    }
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
        access_token: token  // This is the token you logged above
    });
    const event = await Event.findById(eventId);
    if(!event){
        return res.status(404).send('Event not found');
    }

    console.log("Going to Google Calendar");
    const calendar = google.calendar({version: 'v3', auth: oauth2Client, headers: {
        Authorization: `Bearer ${token}`
    }});


    const cleanedReminders = event.reminders.map(reminder => {
        // Remove Mongoose internal properties
        const { _id, __parentArray, $__parent, ...rest } = reminder.toObject ? reminder.toObject() : reminder;
        return rest;  // Return only the cleaned reminder object
    });

   

    console.log("This is the cleanedReminders", cleanedReminders);

    const calendarEvent={
        summary: event.title,
        location: event.location,
        description: event.description, 
        start: {
            dateTime: event.startTime,
            timeZone: event.timezone || 'Asia/Manila',
        },
        end: {
            dateTime: event.endTime,
            timeZone: event.timezone || 'Asia/Manila',
        },
        reminders: {
            useDefault: false,
            overrides: cleanedReminders.map(reminder => ({
                method: reminder.method,
                minutes: reminder.minutesBefore // Ensure the field matches what Google Calendar expects
            }))
        },
        colorId: findClosestColorId(event.color)
    };
    console.log(calendarEvent);
    try {
        await checkAuth(oauth2Client);
        console.log("Inserting to Google Calendar");

        const googleEvent = await calendar.events.insert({
            calendarId: 'primary',
            resource: calendarEvent,
        });

        console.log("Google Event Created:", googleEvent.data);

        const registration = new Registration({
            eventId: eventId,
            userId: userId,
            googleEventId: googleEvent.data.id,
            registeredAt: new Date(),
        });

        console.log(registration);

        await registration.save();
        await emitNewActivity(userId, 'Registered for Event', {eventId: eventId, eventTitle: event.title})

        res.status(200).send(`User ${userId} registered for event ${eventId}`);
    } catch (googleError) {
        console.error("Detailed error:", googleError);  // This will show the full error object
        console.error("Error message:", googleError.message);
        console.error("Error stack:", googleError.stack);
        return res.status(500).send(`Google Calendar error: ${googleError.message}`);
    }
};

const checkRegistration = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;

    try {
        const registration = await Registration.findOne({ eventId, userId });
        if (registration) {
            res.status(200).json({
                isRegistered: true,
                status: registration.status,
                registrationDate: registration.registrationDate,
                googleEventId: registration.googleEventId
            });
        } else {
            res.status(200).json({
                isRegistered: false,
                status: null
            });
        }
    } catch (error) {
        console.error('Registration check error:', error);
        res.status(500).json({
            error: 'Error checking registration status',
            details: error.message
        });
    }
};

// Add this new service method
const cancelRegistration = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;
    const token = req.user.accessToken;
    const event = await Event.findById(eventId);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client }); // Re-initialize calendar here

    try {
        const registration = await Registration.findOne({ eventId, userId });
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // If you're using Google Calendar, remove the event
        if (registration.googleEventId) {
            try {
                await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: registration.googleEventId
                });
                console.log(`Event with ID ${registration.googleEventId} deleted from Google Calendar`);
            } catch (error) {
                console.error('Error deleting Google Calendar event:', error);
                return res.status(500).json({ message: 'Failed to delete event from Google Calendar', details: error.message });
            }
        }

        await Registration.deleteOne({ _id: registration._id });
        await emitNewActivity(userId, 'Unregistered for Event', {eventId: eventId, eventTitle: event.title})
        res.status(200).json({ message: 'Registration cancelled successfully' });
    } catch (error) {
        console.error('Cancel registration error:', error);
        res.status(500).json({
            error: 'Error cancelling registration',
            details: error.message
        });
    }
};

// Render Google Calendar integration page
const renderCalendar = async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.status(200).json(registrations);
    } catch (error) {
        res.status(500).send('Error retrieving events');
    }
};



module.exports = {
    listEvents,
    viewEvent,
    registration,
    renderCalendar,
    checkRegistration,
    cancelRegistration,
};

