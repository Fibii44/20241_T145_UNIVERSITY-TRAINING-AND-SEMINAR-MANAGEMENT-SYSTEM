//replace this with dbconnection 

const renderEventsPage = async (req, res) => {
    try {
        const events = await Event.find();
        res.render('adminEventsPage', { events });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addEvent = async (req, res) => {
    try {
        const { title, description, date, location } = req.body;
        const newEvent = new Event({ title, description, date, location });
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

module.exports = {
    renderEventsPage,
    addEvent,
    viewEventById
}
