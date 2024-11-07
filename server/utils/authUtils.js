const jwt = require('jsonwebtoken');

// Secret key (You should store this in environment variables for security)
const JWT_SECRET = process.env.JWT_SECRET;

// Function to generate a token
const generateToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
  };

  // Token expiration time 
  const options = { expiresIn: '1h' };

  // Generate token
  return jwt.sign(payload, JWT_SECRET, options);
};

module.exports = { generateToken };
