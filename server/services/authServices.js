const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { verifyRecaptcha } = require('../utils/verifyRecaptcha.js');
const { emitNewActivity } = require('../config/socketConfig.js');
const { Timestamp } = require('mongodb');
const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_EXPIRES_IN = '1h'; 

const googleLogin = async (req, res, next) => {
  const { stayLoggedIn } = req.query;

  const state = JSON.stringify({ stayLoggedIn });

  passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
    callbackURL: 'http://localhost:3000/auth/google/callback',
    state
  })(req, res, next);
};

const googleOAuthCallback = (req, res, next) => {
  const { state } = req.query;
  const { stayLoggedIn } = JSON.parse(state);
  console.log(stayLoggedIn);
  const tokenExpiry = stayLoggedIn ? '90d' : JWT_EXPIRES_IN;
  passport.authenticate('google', async (error, user, info) => {
    if (error) {
      return res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token for authenticated user
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        position: user.position,
        college: user.college,
        department: user.department,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        mustChangePassword: user.mustChangePassword,
        status: user.status
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

     await emitNewActivity(user._id, 'Login', {userName: user.name} )

    // Redirect to frontend with the token
    return res.status(200).redirect(`http://localhost:5000/login/success?token=${token}&stayLoggedIn=${stayLoggedIn}`);
  })(req, res, next);
};
// Manual login with reCAPTCHA
const manualLogin = async (req, res) => {
  const { email, password, recaptchaToken, stayLoggedIn } = req.body;
  const tokenExpiry = stayLoggedIn ? '90d' : JWT_EXPIRES_IN;
  try {
    console.log("Recaptcha Token:", recaptchaToken);
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    console.log("reCAPTCHA Response:", isRecaptchaValid); 
    if (!isRecaptchaValid) {
      return res.status(400).json({ success: false, message: 'Invalid reCAPTCHA' });
    }

    const user = await User.findOne({ email });

    if(!user){
      return res.status(404).json({ success: false, message: 'Invalid email or password' });
    }

    console.log('Login attempt with:', {
      email,
      providedPassword: password,
    });
   
    const isPasswordValid = await user.isValidPassword(password);
    console.log("isPasswordValid", isPasswordValid);

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
        profilePicture: user.profilePicture,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        mustChangePassword: user.mustChangePassword,
        status: user.status
      }, 
      JWT_SECRET, 
      { expiresIn: tokenExpiry }
    );
    
    await emitNewActivity(user._id, 'Login', {userName: user.name})

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: 'Login error', error: error.message });
  }
};

const logout = async (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed', error: err });
    }

    // Clear the session cookie
    res.clearCookie('connect.sid'); 

    res.status(200).json({ message: 'Logged out successfully' });
  });
  await emitNewActivity(req.user.id, 'Logout', {userName: req.user.name})
};

const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    console.log("New password:", newPassword);

    const userId = req.user.id;
    const user = await User.findById(userId);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = false;
    await user.save();
    await emitNewActivity(userId, 'Password Changed', {userName: user.name})
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error("Error changing password:", error.message);
    return res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

module.exports = {
  googleLogin,
  googleOAuthCallback,
  manualLogin,
  logout,
  changePassword
};
