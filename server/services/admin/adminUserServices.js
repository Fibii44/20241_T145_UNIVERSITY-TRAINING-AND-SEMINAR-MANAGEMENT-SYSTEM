const bcrypt = require('bcrypt');
const User = require('../../models/user');
const crypto = require('crypto');
const { emitNewActivity } = require('../../config/socketConfig')
const multer = require('multer');
const sendEmail = require('../../utils/sendEmail');
const userNotification = require('../../models/notification');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profilePictures/');
  },
  filename: (req, file, cb) => {
    const shortUUID = uuidv4().split('-')[0];
    const timeStamp = Date.now().toString().slice(-5);
    let uniqueFilename = `${shortUUID}-${timeStamp}${path.extname(file.originalname)}`;

    while(fs.existsSync(path.join(__dirname, `../../uploads/eventPictures/${uniqueFilename}`))) {
      const newUUID = uuidv4.split('-')[0];
      uniqueFilename = `${newUUID}-${timeStamp}${path.extname(file.originalname)}`;
    }

    cb(null, uniqueFilename);
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
    const { name, email, role, phoneNumber, college, department, position } = req.body;
    const profilePicture = req.file ? req.file.filename : null;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }


    const tempPassword = crypto.randomBytes(8).toString('hex'); 
    console.log("Temporary password:", tempPassword);

    const hashedPassword = await bcrypt.hash(tempPassword, 10);


    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      college,
      department,    
      position,
      profilePicture,
      mustChangePassword: true
    });

    await newUser.save();
    console.log(newUser);

    await emitNewActivity(req.user.id, 'Created New User', { userId: newUser._id, userName: newUser.name });

    // Extract access and refresh tokens from req.user, or handle if missing
    const { accessToken, refreshToken } = req.user || {};
    if (!accessToken || !refreshToken) {
      throw new Error("Authentication tokens are missing");
    }


     // Send the temporary password email
     const emailContent = `
     Dear ${name},
     
     Welcome to BukSU Engage!
     
     Your account has been successfully created in the BukSU Training and Seminar Management System.
     
     Your Login Credentials:
     Email: ${email}
     Temporary Password: ${tempPassword}
     
     IMPORTANT SECURITY NOTICE:
     * For security reasons, you will be required to change your password upon your first login.
     * Please keep your credentials confidential.
     * If you didn't request this account, please contact the administrator immediately.
     
     To access the system:
     1. Visit the BukSU Engage Login page
     2. Enter your email and temporary password
     3. Follow the prompts to set your new password
     
     If you have any questions or need assistance, please contact our support team.
     
     Best regards,
     BukSU Engage Admin Team
     `;
   
   await sendEmail(newUser.email, 'Welcome to Your Account', emailContent, { accessToken: req.user.accessToken, refreshToken: req.user.refreshToken });

   res.status(201).json({ 
    message: 'Personnel account created successfully', 
    user: {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      position: newUser.position
    }
  });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const renderUserTable = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field

    res.status(200).json({ users });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};


// Function to edit user details
const editUser = async (req, res) => {
  const userId = req.params.id; // Get user ID from route params
  const updatedData = req.body; // Data to update

  try {
    // Step 1: Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Update the user's fields (unencrypted in memory)
    Object.keys(updatedData).forEach((field) => {
      user[field] = updatedData[field];
    });

    // Step 3: Save the user (triggers encryption)
    const updatedUser = await user.save();

    // Step 4: Respond with the updated user
    res.status(200).json({ updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchEventParticipants = async (req, res) => {
  try{
    const { college } = req.query;
    let query = {};
    if(college && college !== "All") {
      query.department = college;
    }
    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  renderPersonnelPage,
  addPersonnelAccount,
  editUser,
  renderUserTable,
  upload,
  fetchEventParticipants,
};
