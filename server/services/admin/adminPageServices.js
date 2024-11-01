const User =   require('../../models/user');
const Events = require('../../models/event')

const renderLoginPage = async (req, res) => {
    try {
        // Logic for rendering the login page
        res.send('Admin Login');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const renderDashboard = async (req, res) => {
    try {
        // Logic for fetching data to display on the dashboard
        const [totalUsers, totalEvents, upcomingEvents, succesfulEvents, canceledEvents, users] = await Promise.all([
            User.countDocuments(),
            Events.countDocuments(),
            Events.find({ status: 'Upcoming' }).countDocuments(),
            Events.find({ status: 'Succesful' }).countDocuments(),
            Events.find({ status: 'Canceled' }).countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(10),
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

        res.json({
            totalUsers,
            totalEvents,
            upcomingEvents,
            succesfulEvents,
            canceledEvents,
            users,
            monthlyUserData: formattedMonthlyData
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
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



module.exports = {
    renderLoginPage,
    renderDashboard,
    renderCalendarPage,
}