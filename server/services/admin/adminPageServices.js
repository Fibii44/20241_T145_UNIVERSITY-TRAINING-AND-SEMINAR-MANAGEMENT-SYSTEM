const User = require('../../models/user');
const Events = require('../../models/event');
const DeletedEvents = require('../../models/deletedEvents');
const ActivityLog = require('../../models/activityLog');

const renderDashboard = async (req, res) => {
    try {
        // Fetching data for the dashboard
        const [totalUsers, totalEvents, upcomingEvents, successfulEvents, canceledEvents, users] = await Promise.all([
            User.countDocuments(),
            Events.countDocuments(),
            Events.find({ status: 'active' }).countDocuments(),
            Events.find({ status: 'completed' }).countDocuments(),
            DeletedEvents.countDocuments(),
            User.find().sort({ createdAt: -1 }),
        ]);

        // Monthly user data aggregation
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

        // Daily user data aggregation
        const dailyUserData = await User.aggregate([
            {
                $match: { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
            },
            {
                $group: {
                    _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    totalUsers: { $sum: 1 },
                    activeUsers: {
                        $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
                    },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]);

        const formattedDailyData = dailyUserData.map(item => ({
            date: `${item._id.month}-${item._id.day}-${item._id.year}`,
            totalUsers: item.totalUsers,
            activeUsers: item.activeUsers,
        }));

        // Respond with all data
        res.status(200).json({
            totalUsers,
            totalEvents,
            upcomingEvents,
            successfulEvents,
            canceledEvents,
            users,
            monthlyUserData: formattedMonthlyData,
            dailyUserData: formattedDailyData,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
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

        const decryptedLogs = await Promise.all(
            logs.map(async log => {
                if (log.userId) {
                    try {
                        const user = await User.findById(log.userId._id);
                        log.userId = user; // Replace the populated user with decrypted user
                    } catch (error) {
                        console.error(`Error fetching/decrypting userId for log ${log._id}:`, error.message);
                    }
                }
                return log;
            })
        );

        res.status(200).json(decryptedLogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
};

module.exports = {
    renderDashboard,
    renderCalendarPage,
    getLogs
};
