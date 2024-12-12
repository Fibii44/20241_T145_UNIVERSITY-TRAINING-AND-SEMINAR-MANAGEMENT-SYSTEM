const Event = require('../../models/event');

const renderEventHistory = async (req, res) => {
    try {
        const events = await Event.find({"status": "completed"}).sort({ date: -1 }); // Sort by latest events
        res.status(200).json({ events});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateEventReport = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventID);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Generate report based on event data
        const reportData = {}; // Placeholder for report logic
        res.render('adminEventReportPage', { event, reportData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    renderEventHistory,
    generateEventReport
}