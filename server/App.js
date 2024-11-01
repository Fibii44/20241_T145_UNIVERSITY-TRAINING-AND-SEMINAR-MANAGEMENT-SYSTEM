const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();
const dbConnection = require('./config/dbcon');
const passport = require('./config/passport');
const bodyParser = require('body-parser');
require('dotenv').config();



//admin routes
const adminPageRoutes = require('./routes/admin/adminPageRoutes')
const adminEventRoutes = require('./routes/admin/adminEventRoutes')
const adminUserRoutes = require('./routes/admin/adminUserRoutes')
const adminReportRoutes = require('./routes/admin/adminReportRoutes')


//user routes
const userPageRoutes = require('./routes/user/userPageRoutes')
const userEventRoutes = require('./routes/user/userEventRoutes')
const userProfileRoutes = require('./routes/user/userProfileRoutes')

//Auth Routes
const authRoutes = require('./routes/authRoutes')

//Event Routes
const calendarRoutes = require('./routes/admin/adminCalendarRoutes');

const corsOptions = {
    origin: 'http://localhost:5000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true, 
};

app.use(bodyParser.json());


app.use(cors(corsOptions)); 

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

dbConnection();

app.use(passport.initialize())
app.use(passport.session())

app.use("/", adminPageRoutes)
app.use("/", adminEventRoutes)
app.use("/", adminUserRoutes)
app.use("/", adminReportRoutes)

app.use("/", userPageRoutes)
app.use("/", userEventRoutes)
app.use("/", userProfileRoutes)

app.use("/", authRoutes)

app.use('/api', calendarRoutes);

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});