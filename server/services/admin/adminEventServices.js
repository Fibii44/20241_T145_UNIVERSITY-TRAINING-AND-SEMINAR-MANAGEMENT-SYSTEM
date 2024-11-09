const Event = require('../../models/event');
const DeletedEvent = require('../../models/deletedEvents');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
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
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  }
});


const renderEventsPage = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addEvent = async (req, res) => {
  try {
    const {title, eventDate, startTime, endTime, location, name, hostname, description, participantGroup, color, customParticipants } = req.body;
    console.log(req.file)
    const eventPicture = req.file ? req.file.filename : null; // Set eventPicture 
    const user = req.user;
    const newEvent = new Event({
      title,
      eventDate,  
      eventPicture,
      startTime,
      endTime,
      location, 
      hostname,
      description,
      participantGroup,
      color,
      customParticipants,
      createdBy: user.id,
      isLocked: false,
      lockedBy: null,
    });
    await newEvent.save();
    res.status(201).json({ message: 'Event added successfully', newEvent });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    // Fetch the event from the database
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // If the event is locked by another user, prevent editing
    if (event.isLocked && event.lockedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Event is currently being edited by another admin.' });
    }

    // Lock the event for the current user
    await Event.findByIdAndUpdate(eventId, { isLocked: true, lockedBy: userId });

    // Ensure the 'createdBy' field is not modified
    if (!event.createdBy) {
      event.createdBy = userId;
    }

    // Allow 'editedBy' to be updated
    updates.editedBy = userId;

    // Handle image update logic
    if (req.file) {
      // Delete the old image file if it exists
      const oldImagePath = path.join(__dirname, `../../uploads/eventPictures/${event.eventPicture}`);
      if (event.eventPicture && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Delete the old image
      }

      updates.eventPicture = req.file.filename; // Set the new image filename
    }

    // Remove 'createdBy' from updates to prevent it from being overwritten
    delete updates.createdBy;

    // Update the event, with 'createdBy' fixed and 'editedBy' updated
    const updatedEvent = await Event.findByIdAndUpdate(eventId, updates, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Unlock the event after updating
    await Event.findByIdAndUpdate(eventId, { isLocked: false, lockedBy: null });

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, role } = req.user; 

    // Find the event to be deleted
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Prepare the data to be stored in the deletedEvents collection
    const deletedEventData = {
      ...event.toObject(), 
      deletedByName: name, 
      deletedByRole: role, 
      deletedAt: new Date(), 
    };

    // Save the event in the deletedEvents collection
    await DeletedEvent.create(deletedEventData);

    // Delete the original event
    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  renderEventsPage,
  addEvent,
  updateEvent,
  deleteEvent,
  upload
};
