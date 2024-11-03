const bcrypt = require('bcrypt');
const User = require('../../models/user');
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profilePictures/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  }
});

const renderPersonnelPage = async (req, res) => {
  try {
    res.send('adminPersonnelPage');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addPersonnelAccount = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, department, position } = req.body;
    const profilePicture = req.file ? req.file.filename : null;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      department,
      position,
      profilePicture
    });

    await newUser.save();
    res.status(201).json({ message: 'Personnel account created', newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const renderUserTable = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    res.json(users);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Function to edit user details
const editUser = async (req, res) => {
  const userId = req.params.id; 
  const updatedData = req.body; 

  try {
      const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true });
      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Function to delete user and transfer the deleted data to a new deleted user collection 
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    const deletedBy = req.body.deletedBy; 

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new DeletedUser document
        const deletedUser = new DeletedUser({
            name: user.name,
            email: user.email,
            role: user.role,
            position: user.position,
            department: user.department,
            phoneNumber: user.phoneNumber,
            deletedBy: deletedBy, 
            deletedAt: new Date() 
        });

        await deletedUser.save(); 
        await User.findByIdAndDelete(userId); // Delete the user from users collection

        res.status(200).json({ message: 'User deleted successfully', deletedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
  renderPersonnelPage,
  addPersonnelAccount,
  editUser,
  renderUserTable,
  deleteUser,
  upload
};