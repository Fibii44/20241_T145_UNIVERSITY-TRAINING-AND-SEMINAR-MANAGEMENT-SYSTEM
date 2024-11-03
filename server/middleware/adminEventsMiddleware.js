const checkLockStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (event.isLocked) {
      return res.status(403).json({ message: 'Event is currently being edited by another admin.' });
    }
    res.status(200).json({ isLocked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const canEditEvent = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;

  // Departmental admins can only edit events they created
  if (user.role === 'departmental_admin') {
    const event = await Event.findById(id);
    if (!event || !event.createdBy.equals(user.id)) {
      return res.status(403).json({ message: 'Unauthorized to edit this event.' });
    }
  }

  next();
};
  
  // Clear lock after saving or closing event
  const clearEventLock = async (req, res, next) => {
    const user = req.user;
    if (user.role === 'general_admin') {
      await Event.updateMany({ lockedBy: user.id }, { $set: { isLocked: false, lockedBy: null } });
    }
    next();
  };

  const Event = require('../models/event');

  // Middleware to handle concurrency lock for general admins
  const concurrencyLock = async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
  
    // Only applies to general admins
    if (user.role === 'general_admin') {
      const activeEvent = await Event.findOne({ isLocked: true });
  
      // Check if activeEvent is locked and if lockedBy is valid before using .equals()
      if (activeEvent && activeEvent.lockedBy && activeEvent.lockedBy.equals && !activeEvent.lockedBy.equals(user.id)) {
        return res.status(403).json({ message: 'Another admin is currently editing. Please wait.' });
      }
  
      // Lock the event for editing by this user
      await Event.findByIdAndUpdate(id, { isLocked: true, lockedBy: user.id });
    }
  
    next();
  };
  
  
  // Middleware to release the concurrency lock
  const clearConcurrencyLock = async (req, res, next) => {
    const user = req.user;
    if (user.role === 'general_admin') {
      await Event.updateMany({ lockedBy: user.id }, { $set: { isLocked: false, lockedBy: null } });
    }
    next();
  };
  
module.exports = { checkLockStatus, canEditEvent, clearEventLock, concurrencyLock, clearConcurrencyLock };