// services/adminUserService.js
//authentication

const renderPersonnelPage = async (req, res) => {
    try {
        // Logic for rendering the personnel page
        res.send('adminPersonnelPage');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

 const addPersonnelAccount = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: 'Personnel account created', newUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const renderUserTable = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password field
        res.send('adminUserTable', { users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    renderPersonnelPage,
    addPersonnelAccount,
    renderUserTable
}
