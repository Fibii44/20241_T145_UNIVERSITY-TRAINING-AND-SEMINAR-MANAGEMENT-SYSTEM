const Event = require('../../models/event');
const User = require('../../models/user');
const Notification = require('../../models/notification');
const { initialize } = require('../../config/googleConfig');
const axios = require('axios');
const { emitNewActivity } = require('../../config/socketConfig');
const DeletedEvent = require('../../models/deletedEvents');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { google } = require('googleapis');
const Registration = require('../../models/registration');
const fs = require('fs');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/eventPictures/');
  },
  filename: (req, file, cb) => {
    const shortUUID = uuidv4().split('-')[0];
    const timeStamp = Date.now().toString().slice(-5);
    let uniqueFilename = `${shortUUID}-${timeStamp}${path.extname(file.originalname)}`;

    while(fs.existsSync(path.join(__dirname, `../../uploads/eventPictures/${uniqueFilename}`))) {
      const newUUID = uuidv4.split('-')[0];
      uniqueFilename = `${newUUID}-${timeStamp}${path.extname(file.originalname)}`;
    }

    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  }
});

const findClosestColorId = (hexColor) => {
  const GOOGLE_CALENDAR_COLORS = {
    '1': '#7986cb', // Lavender
    '2': '#33b679', // Green
    '3': '#8e24aa', // Purple
    '4': '#e67c73', // Red
    '5': '#f6bf26', // Yellow
    '6': '#f4511e', // Orange
    '7': '#039be5', // Turquoise
    '8': '#616161', // Gray
    '9': '#3f51b5', // Bold Blue
    '10': '#0b8043', // Bold Green
    '11': '#d50000'  // Bold Red
  };

  if (!hexColor) return '1'; // Default color if none provided

  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  let closestColorId = '1';
  let minDistance = Infinity;

  Object.entries(GOOGLE_CALENDAR_COLORS).forEach(([colorId, googleHex]) => {
    const googleRGB = {
      r: parseInt(googleHex.substring(1, 3), 16),
      g: parseInt(googleHex.substring(3, 5), 16),
      b: parseInt(googleHex.substring(5, 7), 16),
    };

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

const renderEventsPage = async (req, res) => {
  try {
    const events = await Event.find();

    // Check if events exist
    if (!events || events.length === 0) {
      return res.status(404).json({ message: "No events found" }); // Return 404 error
    }

    // If events exist, return them
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const renderActiveEventsPage = async (req, res) => {
  try {
    const user = req.user;

    if(user.role === 'admin'){
      const events = await Event.find({status: "active"});
      res.status(200).json(events);
    }else{
      const events = await Event.find({status: "active"});
      res.status(200).json(events.filter(event => event.createdBy.equals(user.id)));
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const addEvent = async (req, res) => {
  try {
    const {title, eventDate, startTime, endTime, location, description, participantGroup, color, customParticipants, reminders, formLink, formId} = req.body;
    console.log(req.files)
    const eventPicture = req.file ? req.file.filename : null // Set eventPicture 
    
    const user = req.user;
    const newEvent = new Event({
      title,
      eventDate,  
      eventPicture,
      startTime,
      endTime,
      location, 
      description,
      participantGroup,
      color,
      customParticipants,
      reminders,
      formLink,
      formId,
      createdBy: user.id,
      isLocked: false,
      lockedBy: null,
    });
    console.log(newEvent);
    await newEvent.save();

  // Ensure conditions are added properly
  const conditions = [];

  // Add customParticipants to conditions
  if (newEvent.customParticipants?.length > 0) {
    conditions.push({ email: { $in: newEvent.customParticipants } });
  }
  
  
  if (participantGroup && participantGroup.college) {
    const activeUsers = await User.find({ status: "active" });
  
    const relevantUsers = activeUsers.filter((user) => {
      const { role, college, department } = user; // Decrypted automatically
  
      // Ensure only faculty_staff are considered
      if (role !== "faculty_staff") return false;
  
      // If "all colleges" is selected, include all faculty_staff users
      if (participantGroup.college.toLowerCase() === "all") {
        return true;
      }
  
      // If a specific college is selected
      if (college === participantGroup.college) {
        // If "all departments" is selected, include all users in the college
        if (
          participantGroup.department.toLowerCase() === "all" || 
          !participantGroup.department
        ) {
          return true;
        }
  
        // Otherwise, match the specific department
        return department === participantGroup.department;
      }
  
      // Exclude users not matching the college
      return false;
    });
  
    // Add relevant users to the conditions
    if (relevantUsers.length > 0) {
      conditions.push({ _id: { $in: relevantUsers.map((user) => user._id) } });
    }
  }
  
  // Perform query only if conditions are valid
  const users = conditions.length > 0 ? await User.find({ $or: conditions }) : [];

  // Create userNotifications array
  const userNotifications = users.map(user => ({
    userId: user._id,
    name: user.name,
    status: 'unread', // Set status as unread initially
  }));

  // Create notification for the event
  const notification = {
    title: newEvent.title,
    message: `You are invited to attend the event titled "${newEvent.title}" on ${new Date(newEvent.eventDate).toLocaleDateString('en-PH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${newEvent.location}.`,
    eventId: newEvent._id,
    customParticipants: newEvent.customParticipants, // Array of custom participants
    participantGroup: newEvent.participantGroup,
    userNotifications: userNotifications,
    createdAt: new Date(),
  };

// Log notification before saving
  console.log("Notification Object:", notification);
  await Notification.create(notification);

  const cleanedReminders = newEvent.reminders.map(reminder => {
    const { _id, __parentArray, $_parent, ...cleanedReminder } = reminder.toObject ? reminder.toObject() : reminder;
    return cleanedReminder;
  });

  if(user.accessToken){
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });


    try{
      const calendarEvent = {
        summary: newEvent.title,
        location: newEvent.location,
        description: newEvent.description,
        start: { dateTime: newEvent.startTime, timeZone: 'Asia/Manila' },
        end: { dateTime: newEvent.endTime, timeZone: 'Asia/Manila' },
        reminders: {
          useDefault: false,
          overrides: cleanedReminders.map(reminder => ({
            method: reminder.method,
            minutes: reminder.minutesBefore,
          })),
        },
        colorId: findClosestColorId(newEvent.color)
      };

      const createdEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: calendarEvent,
      });

      newEvent.googleEventId = createdEvent.data.id;
      await newEvent.save();

      console.log('Successfully created calendar event:', createdEvent.data);
    }catch(googleError){
      console.error('Error creating calendar event:', googleError);
    }
  }

  await emitNewActivity(user.id, 'Created New Event', { eventId: newEvent._id, eventTitle: newEvent.title });
  res.status(201).json({ message: 'Event added successfully', newEvent });

  } catch (error) {
   }
};

const getSpecificEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    console.log('Starting event update for eventId:', eventId);
    console.log('Update data:', updates);

    // Fetch the existing event
    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Ensure the 'createdBy' field is not modified
    if (!existingEvent.createdBy) {
      existingEvent.createdBy = userId; // Set createdBy only if it is not already set
    }
    existingEvent.editedBy = req.user.id; // Set editedBy to current user

    // Handle image update logic
    if (req.file) { // Check if a new file has been uploaded
      const oldImagePath = path.join(__dirname, `../../uploads/eventPictures/${existingEvent.eventPicture}`);
      if (existingEvent.eventPicture && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Delete old image file
      }
      existingEvent.eventPicture = req.file.filename; // Update to new image filename
    }
    

    // Remove 'createdBy' from updates to prevent it from being overwritten
    delete updates.createdBy;

    // Update fields while preserving createdBy
    Object.assign(existingEvent, updates);

    const updatedEvent = await existingEvent.save();
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found after update attempt' });
    }
    console.log('Event updated in database:', updatedEvent);

    // Process reminders
    const updatedReminders = (updates.reminders || updatedEvent.reminders).map(reminder => {
      const { _id, __parentArray, $_parent, ...cleanedReminder } = reminder.toObject ? reminder.toObject() : reminder;
      return cleanedReminder;
    });
    console.log(updatedReminders);

    const adminUser = req.user;

    if(adminUser.accessToken){
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/google/callback'
      );

      oauth2Client.setCredentials({
        access_token: adminUser.accessToken,
        refresh_token: adminUser.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      try{
        const calendarEvent = {
          summary: updatedEvent.title,
          location: updatedEvent.location,
          description: updatedEvent.description,
          start: { dateTime: updatedEvent.startTime, timeZone: 'Asia/Manila' },
          end: { dateTime: updatedEvent.endTime, timeZone: 'Asia/Manila' },
          reminders: {
            useDefault: false,
            overrides: updatedReminders.map(reminder => ({
              method: reminder.method,
              minutes: reminder.minutesBefore,
            })),
          },
          colorId: findClosestColorId(updatedEvent.color)
        };

        const result = await calendar.events.patch({
          calendarId: 'primary',
          eventId: updatedEvent.googleEventId,
          requestBody: calendarEvent,
        });

        console.log('Successfully updated calendar event:', result.data);
      }catch(googleError){
        console.error('Error updating calendar event:', googleError);

        if(googleError.code === 401){
          console.log('Attempting to refresh token...');
        }

        try{
          oauth2Client.setCredentials({ refresh_token: adminUser.refreshToken });
          const { tokens } = await oauth2Client.refreshAccessToken();
          adminUser.accessToken = tokens.access_token;
          await adminUser.save();

          await calendar.events.patch({
            calendarId: 'primary',
            eventId: updatedEvent.googleEventId,
            requestBody: calendarEvent,
          });
        }catch(refreshError){
          console.error('Token refresh failed:', refreshError);
        }
      }
    }

    // Fetch registrations related to this event
    const registrations = await Registration.find({ eventId: eventId }).populate('userId');
    console.log(`Found ${registrations.length} registrations for this event`);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/google/callback'
    );

    for (const registration of registrations) {
      try {
        console.log('\nProcessing registration:', registration._id);
        console.log('GoogleEventId:', registration.googleEventId);

        const registeredUser = registration.userId; // Populated user data

        if (!registeredUser.accessToken) {
          console.log(`No access token for user ${registeredUser._id}`);
          continue; // Skip this user if no access token
        }

        oauth2Client.setCredentials({
          access_token: registeredUser.accessToken,
          refresh_token: registeredUser.refreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const calendarEvent = {
          summary: updatedEvent.title,
          location: updatedEvent.location,
          description: updatedEvent.description,
          start: { dateTime: updatedEvent.startTime, timeZone: 'Asia/Manila' },
          end: { dateTime: updatedEvent.endTime, timeZone: 'Asia/Manila' },
          reminders: {
            useDefault: false,
            overrides: updatedReminders.map(reminder => ({
              method: reminder.method,
              minutes: reminder.minutesBefore,
            })),
          },
          colorId: findClosestColorId(updatedEvent.color)
        };

        console.log('Calendar event to be updated:', calendarEvent);

        try {
          const result = await calendar.events.patch({
            calendarId: 'primary',
            eventId: registration.googleEventId,
            requestBody: calendarEvent,
          });

          console.log('Successfully updated calendar event:', result.data);
        } catch (calendarError) {
          console.error('Google Calendar API Error:', { message: calendarError.message });

          if (calendarError.code === 401) {
            console.log('Attempting to refresh token...');

            try {
              oauth2Client.setCredentials({ refresh_token: registeredUser.refreshToken });
              const { tokens } = await oauth2Client.refreshAccessToken();

              console.log('New tokens received:', tokens);

              const user = await User.findOne(registeredUser._id);
              user.accessToken = tokens.access_token;
              await user.save();

              await calendar.events.patch({
                calendarId: 'primary',
                eventId: registration.googleEventId,
                requestBody: calendarEvent,
              });

              console.log('Successfully updated calendar event after token refresh');
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
        }
      } catch (userError) {
        console.error(`Error updating event ${registration.googleEventId} in calendar:`, userError);
      }
    }

    // Unlock the event after updating
    await Event.findByIdAndUpdate(eventId, { isLocked: false, lockedBy: null });

    // Update notifications about the event update
    const updatedNotificationMessage = `The event titled "${updatedEvent.title}" has been updated. Check the updated details and join us again on ${new Date(updatedEvent.eventDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })} at ${updatedEvent.location}.`;

    // Fetch notifications linked to the event
    const notifications = await Notification.find({ eventId });

    // Update each notification document
    for (const notification of notifications) {
      notification.message = updatedNotificationMessage; // Update the message field
      notification.title = updatedEvent.title; // Update the title field
      notification.updatedAt = new Date(); // Update the timestamp

      // Update user notifications array
      notification.userNotifications.forEach((userNotification) => {
        userNotification.status = 'unread'; // Reset status to unread
        userNotification.readAt = null; // Clear the readAt field
      });

      // Save the updated notification (this triggers encryption)
      await notification.save();
    }

    await emitNewActivity(userId, 'Updated Event', { eventId, eventTitle: updatedEvent.title });

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ message: error.message });
  }
};


const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const adminUser = req.user;
    const { name, role } = req.user;
    

    // Find the event to be deleted
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if(adminUser.accessToken && event.googleEventId){
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/google/callback'
      );

      oauth2Client.setCredentials({
        access_token: adminUser.accessToken,
        refresh_token: adminUser.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      try{
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: event.googleEventId,
        });

        console.log('Successfully deleted calendar event:', result.data);
      }catch(googleError){
        console.error('Error deleting calendar event:', googleError);

        if(googleError.code === 401){
          console.log('Attempting to refresh token...');
        }

        try{
          oauth2Client.setCredentials({ refresh_token: adminUser.refreshToken });
          const { tokens } = await oauth2Client.refreshAccessToken();

          console.log('New tokens received:', tokens);

          const user = await User.findOne(adminUser._id);
          user.accessToken = tokens.access_token;

          await calendar.events.delete({  
            calendarId: 'primary',
            eventId: event.googleEventId,
          });
        }catch(refreshError){
          console.error('Token refresh failed:', refreshError);
        }
      }
    }

    const registrations = await Registration.find({ eventId: eventId}).populate('userId')
    
     // Delete the associated notifications for this event
     await Notification.deleteOne({ eventId });

    // Prepare the data to be stored in the deletedEvents collection
    const deletedEventData = {
      ...event.toObject(),
      deletedByName: name,
      deletedByRole: role,
      deletedAt: new Date(),
    };

    delete deletedEventData._id;

    // Save the event in the deletedEvents collection
    console.log(deletedEventData);
    await DeletedEvent.create(deletedEventData);

    // Check if there is an associated picture and delete it
    if (event.eventPicture) {
      const imagePath = path.join(__dirname, '../../uploads/eventPictures', event.eventPicture);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Delete the image file
          console.log(`Deleted picture: ${imagePath}`);
        }
      } catch (error) {
        console.error(`Failed to delete event picture: ${error.message}`);
        // Log the error but continue with event deletion
      }
    }

    

    // Delete the original event from the Event collection
    await Event.findByIdAndDelete(eventId);


    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/google/callback'
    )

    for (const registration of registrations) {
      try{
        const registeredUser = registration.userId;

        if(!registeredUser.accessToken || !registration.googleEventId){
          console.log(`Skipping user ${registeredUser._id}: Missing access token or Google Event ID`);
          continue;
        }

        oauth2Client.setCredentials({
          access_token: registeredUser.accessToken,
          refresh_token: registeredUser.refreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        try{
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: registration.googleEventId,
          });

          console.log(`Deleted Google Calendar Event for: ${registeredUser._id}`);

        }catch(calendarError){
          console.error(`Error deleting Google Calendar Event for ${registeredUser._id}:`, calendarError);

          if(calendarError.code === 401){ 
            console.log('Attempting to refresh token...');

            try{
              oauth2Client.setCredentials({ refresh_token: registeredUser.refreshToken });
              const { tokens } = await oauth2Client.refreshAccessToken();
              
            console.log('New tokens received:', tokens);

            const user = await User.findOne(registeredUser._id);
            user.accessToken = tokens.access_token;
            await user.save();



            await calendar.events.delete({
              calendarId: 'primary',
              eventId: registration.googleEventId,
            });
          }catch(refreshError){
              console.error(`Token refresh failed for ${registeredUser._id}:`, refreshError);
            }
          }
        }
      }catch(userError){
        console.error(`Error updating event ${registration.googleEventId} in calendar:`, userError);
      }
    }


    await emitNewActivity(req.user.id, 'Deleted Event', {eventId: eventId, eventTitle: event.title})

    res.status(200).json({ message: 'Event and associated picture deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  renderEventsPage,
  renderActiveEventsPage,
  addEvent,
  updateEvent,
  deleteEvent,
  getSpecificEvent,
  upload
};