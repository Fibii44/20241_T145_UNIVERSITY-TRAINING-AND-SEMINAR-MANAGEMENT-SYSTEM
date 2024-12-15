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
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,        
      email: decoded.email,   
      college: decoded.college,    
      department: decoded.department,
      phoneNumber: decoded.phoneNumber,
      accessToken: decoded.accessToken,
      refreshToken: decoded.refreshToken,
      iat: decoded.iat,
      exp: decoded.exp
    };
    console.log("User Information:", req.user); // Log the user information
    next();
  } catch (error) {
    console.error("Error decoding token:", error); // Log any decoding errors
    res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateJWT;
