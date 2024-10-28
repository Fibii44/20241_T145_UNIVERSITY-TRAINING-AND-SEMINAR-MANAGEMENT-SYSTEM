const passport = require('passport');
const User = require('../models/user');

const googleOAuthCallback = (req, res, next) => {
  passport.authenticate('google', async (error, user, info) => {
    if (error) {
      console.error("Authentication error:", error);
      return res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: 'User not found' });
    }

    try {
      let existingUser = await User.findOne({ googleId: user.googleId });

      if (!existingUser) {
        // First-time login, skip role and name validation
        console.log("First time login, skipping validation");
        req.logIn(user, (err) => { 
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: 'Login failed', error: err.message });
          }
          console.log("User logged in:", user);
          // Send a JSON response with a success message and a flag
          return res.json({ success: true, message: 'Login successful!' }); 
        });
      } else {
        // User exists, perform validation as before
        console.log("User exists, performing validation");
        if (!existingUser.role || !existingUser.name) {
          return res.status(400).json({ 
            message: 'User validation failed', 
            error: 'role and name are required' 
          });
        }

        req.logIn(existingUser, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: 'Login failed', error: err.message });
          }
          console.log("User logged in:", existingUser);
          // Send a JSON response with a success message and a flag
          return res.redirect('http://localhost:5000/dashboard');
        });
      }
    } catch (error) {
      console.error("Error during user lookup or login:", error);
      return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  })(req, res, next);
};

module.exports = {
  googleOAuthCallback, 
};