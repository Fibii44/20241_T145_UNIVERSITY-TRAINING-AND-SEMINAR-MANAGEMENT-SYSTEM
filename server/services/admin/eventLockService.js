const sseService = require('../../utils/sse');

const lockEvent = async (req, res) => {
    const eventId = req.params.id;
    sseService.broadcastSSE(req.app, { eventId, isLocked: true });
    res.status(200).json({ message: 'Event locked for editing' });
}

const unlockEvent = async (req, res) => {
    const eventId = req.params.id;
    sseService.broadcastSSE(req.app, { eventId, isLocked: false });
    res.status(200).json({ message: 'Event unlocked' });
}

module.exports = { lockEvent, unlockEvent };
