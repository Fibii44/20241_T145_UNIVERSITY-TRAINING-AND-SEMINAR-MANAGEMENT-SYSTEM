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
    if (user.role === 'admin') {
      await Event.updateMany({ lockedBy: user.id }, { $set: { isLocked: false, lockedBy: null } });
    }
    next();
  };

  const Event = require('../models/event');

  // Middleware to handle concurrency lock for general admins
  const concurrencyLock = async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
  
    if (user.role === 'admin' || 'departmental_admin') {
      const event = await Event.findById(id);
  
      // If locked by another user, deny access
      if (event.isLocked && event.lockedBy && !event.lockedBy.equals(user.id)) {
        return res.status(403).json({ message: 'Event is being edited by another admin.' });
      }
  
      // Otherwise, lock it for the current user
      await Event.findByIdAndUpdate(id, { isLocked: true, lockedBy: user.id });
    }
  
    next();
  };
  
  // Middleware to release the concurrency lock
  const clearConcurrencyLock = async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
  
    if (user.role === 'admin' || 'departmental-admin') {
      await Event.findByIdAndUpdate(id, { isLocked: false, lockedBy: null });
    }
    next();
  };
  
module.exports = { checkLockStatus, canEditEvent, clearEventLock, concurrencyLock, clearConcurrencyLock };