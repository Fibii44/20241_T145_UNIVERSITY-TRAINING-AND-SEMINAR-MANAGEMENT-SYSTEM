const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { verifyRecaptcha } = require('../utils/verifyRecaptcha.js');

const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_EXPIRES_IN = '1h'; 

const googleOAuthCallback = (req, res, next) => {
  passport.authenticate('google', (error, user, info) => {
    if (error) {
      return res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate JWT token for authenticated user
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        position: user.position,
        department: user.department,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Redirect to frontend with the token
    return res.redirect(`http://localhost:5000/login/success?token=${token}`);
  })(req, res, next);
};
// Manual login with reCAPTCHA
const manualLogin = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  console.log("Request Body:", req.body);

  console.log("bcrypt version:", bcrypt.version);
  try {
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    console.log("reCAPTCHA Response:", isRecaptchaValid); 
    if (!isRecaptchaValid) {
      return res.status(400).json({ success: false, message: 'Invalid reCAPTCHA' });
    }

    const user = await User.findOne({ email });
    console.log("User found:", user); 

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password,   
 user.password);
    console.log("Is password valid:", isPasswordValid); 

    if (!isPasswordValid)   
 {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,   
        name: user.name, 
        email: user.email, 
        position: user.position,
        department: user.department,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture 
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: 'Login error', error: error.message });
  }
};


module.exports = {
  googleOAuthCallback,
  manualLogin
};
