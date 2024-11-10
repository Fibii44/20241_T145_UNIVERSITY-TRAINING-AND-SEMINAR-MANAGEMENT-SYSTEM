const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decoded); // Log the decoded token
    req.user = decoded; // Attach decoded user information to req.user
    console.log("User Information:", req.user); // Log the user information
    next();
  } catch (error) {
    console.error("Error decoding token:", error); // Log any decoding errors
    res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateJWT;
