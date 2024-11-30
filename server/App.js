const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();
const dbConnection = require('./config/dbcon'); // Handles mongoose connection
const passport = require('./config/passport');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// admin routes
const adminPageRoutes = require('./routes/admin/adminPageRoutes');
const adminEventRoutes = require('./routes/admin/adminEventRoutes');
const adminUserRoutes = require('./routes/admin/adminUserRoutes');
const adminReportRoutes = require('./routes/admin/adminEventReportRoutes');

// user routes
const formSubmissionRoutes = require('./routes/user/formSubmissionRoutes');
const userPageRoutes = require('./routes/user/userPageRoutes');
const userEventRoutes = require('./routes/user/userEventRoutes');
const userProfileRoutes = require('./routes/user/userProfileRoutes');

// Auth Routes
const authRoutes = require('./routes/authRoutes');

// Event Routes

const corsOptions = {
  origin: 'http://localhost:5000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
  credentials: true, 
};

app.get('/eventPictures/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'uploads', 'eventPictures', filename); // Corrected path

  console.log("Trying to access file:", imagePath); // Log the file path

  res.download(imagePath, filename, (err) => { 
    if (err) {
      console.error("Error downloading file:", err);
      res.status(404).send('File not found'); 
    }
  });
});

app.use(bodyParser.json());
app.use(cors(corsOptions)); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));


app.locals.sseClients = []; // Array to store SSE clients

// Serve images in the 'eventPictures' folder
app.use('/eventPictures', express.static(path.join(__dirname, 'uploads', 'eventPictures')));

// Initialize database connection (handled by dbConnection)
dbConnection(); 

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Route handlers
app.use("/", authRoutes);
app.use("/", adminPageRoutes);
app.use("/", adminEventRoutes);
app.use("/", adminUserRoutes);
app.use("/", adminReportRoutes);
app.use("/", formSubmissionRoutes);
app.use("/", userPageRoutes);
app.use("/", userEventRoutes);
app.use("/", userProfileRoutes);

const userNotification = require('./routes/user/userNotificationRoutes');
app.use('/', userNotification);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});