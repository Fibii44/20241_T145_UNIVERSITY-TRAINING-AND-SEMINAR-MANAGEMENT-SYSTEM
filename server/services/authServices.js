const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_EXPIRES_IN = '1h'; 

const googleOAuthCallback = (req, res, next) => {
  passport.authenticate('google', async (error, user, info) => {
    if (error) {
      return res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    try {
      let existingUser = await User.findOne({ googleId: user.googleId });

      if (!existingUser) {
        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Login failed', error: err.message });
          }

          // Generate JWT Token
          const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email, profilePicture: user.profilePicture }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

          return res.json({ success: true, token, message: 'Login successful!' });
        });
      } else {
        req.logIn(existingUser, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Login failed', error: err.message });
          }

          // Generate JWT Token
          const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email, profilePicture: user.profilePicture }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
          
          return res.redirect(`http://localhost:5000/login/success?token=${token}`)
        });
      }
    } catch (error) {
      return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  })(req, res, next);
};

module.exports = {
  googleOAuthCallback,
};
