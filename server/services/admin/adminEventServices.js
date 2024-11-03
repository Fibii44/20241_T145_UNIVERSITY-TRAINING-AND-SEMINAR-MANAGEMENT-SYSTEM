const mongoose = require('mongoose');
const Event = require('../../models/event'); 

require('../../config/dbcon');

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
    const { summary, date, startTime, endTime, location, hostname, description, color } = req.body;
    const newEvent = new Event({
      summary,
      date,
      startTime,
      endTime,
      location,
      hostname,
      description,
      color
    });
    await newEvent.save();
    res.status(201).json({ message: 'Event added successfully', newEvent });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const viewEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateEvent = async (req, res) => {
    try {
      const eventId = req.params.id;
      const updates = req.body; // Assuming you send update data in the request body
  
      const updatedEvent = await Event.findByIdAndUpdate(eventId, updates, {
        new: true, // This option returns the updated document
      });
  
      if (!updatedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      res.status(200).json({ 
        message: 'Event updated successfully', 
        event: updatedEvent 
      });
    } catch (error) {
      res.status(400).json({   
   message: error.message });
    }
  };
  
  const deleteEvent = async (req, res) => {
    try {
      const eventId = req.params.id;
  
      const deletedEvent = await Event.findByIdAndRemove(eventId);
  
      if (!deletedEvent) {
        return res.status(404).json({   
   message: 'Event not found' });
      }
  
      res.status(200).json({ 
        message: 'Event deleted successfully',   
   
        event: deletedEvent 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports = {
    renderEventsPage,
    addEvent,
    viewEventById,
    updateEvent, // Add this
    deleteEvent, // Add this
  };
