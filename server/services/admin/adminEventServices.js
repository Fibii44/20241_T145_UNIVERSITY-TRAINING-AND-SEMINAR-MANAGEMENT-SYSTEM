const Event = require('../../models/event');

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
    const { eventPicture, title, eventDate, startTime, endTime, location, name, hostname, description, participantGroup, customParticipants } = req.body;
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
    
    console.log(eventId);
    console.log(userId);
    console.log(updates);
    
    console.log("Event lock status:", event.isLocked, "Locked by:", event.lockedBy);
    console.log("Current user trying to edit:", userId);

    // Check if the event is locked by another user
    const event = await Event.findById(eventId);
    if (event.isLocked && event.lockedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Event is currently being edited by another admin.' });
    }

    // Lock the event for the current user
    await Event.findByIdAndUpdate(eventId, { isLocked: true, lockedBy: userId });

    // Update the event
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
    const eventId = req.params._id;
    const userId = req.user.id;

    // Check if the event is locked by another user
    const event = await Event.findById(eventId);
    if (event.isLocked && event.lockedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Event is currently being edited by another admin.' });
    }

    // Lock the event for the current user
    await Event.findByIdAndUpdate(eventId, { isLocked: true, lockedBy: userId });

    // Delete the event
    const deletedEvent = await Event.findByIdAndRemove(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Unlock the event after deleting
    await Event.updateOne({ _id: eventId }, { isLocked: false, lockedBy: null });

    res.status(200).json({ message: 'Event deleted successfully', event: deletedEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  renderEventsPage,
  addEvent,
  updateEvent,
  deleteEvent,
};
