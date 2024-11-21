const renderHomePage = async (req, res) => {
    try{
        res.send('Welcome to the University Training and Seminar Management System');
    }catch(err) {
        res.status(500).json({ message: error.message });
    }
};

const renderLoginPage = async (req, res) => {
    try{
        res.send('User Login');
    }catch(err) {
        res.status(500).json({ message: error.message });
    }
};


const renderNotification = async (req, res) => {
    try{
        res.send('Notification Page')
    }catch(err){
        res.status(500).json({ message: error.message})
    }
}
module.exports = {
    renderHomePage,
    renderLoginPage,
    renderNotification
};