const User =   require('../../models/user');
const Events = require('../../models/event')
const DeletedEvents = require('../../models/deletedEvents');
const ActivityLog = require('../../models/activityLog');


const renderDashboard = async (req, res) => {
    try {
        // Logic for fetching data to display on the dashboard
        const [totalUsers, totalEvents, upcomingEvents, successfulEvents, canceledEvents, users] = await Promise.all([
            User.countDocuments(),
            Events.countDocuments(),
            Events.find({ status: 'active' }).countDocuments(),
            Events.find({ status: 'completed' }).countDocuments(),
            DeletedEvents.countDocuments(),
            User.find().sort({ createdAt: -1 }),
        ]);

        const monthlyUserData = await User.aggregate([
            {
                $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) } },
            },
            {
                $group: {
                  _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                  totalUsers: { $sum: 1 },
                  activeUsers: {
                    $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
                  },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        const formattedMonthlyData = monthlyUserData.map(item => ({
            month: `${item._id.month}-${item._id.year}`,
            totalUsers: item.totalUsers,
            activeUsers: item.activeUsers,
          }));

        res.status(200).json({
            totalUsers,
            totalEvents,
            upcomingEvents,
            successfulEvents,
            canceledEvents,
            users,
            monthlyUserData: formattedMonthlyData
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

const renderCalendarPage = async (req, res) => {
    try {
        // Logic for rendering the calendar page with events
        const events = []; // Fetch events data
        res.send('Welcome to Calendar');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .populate('userId', 'name email profilePicture')
            .sort({ timestamp: -1 });

        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    renderDashboard,
    renderCalendarPage,
    getLogs
}