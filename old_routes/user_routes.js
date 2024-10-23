const express = require('express');
const userRoutes = express.Router()

//Landing Page
userRoutes.get('/', (req,res) => {
    res.send('Landing Page');
});

//Login Page
userRoutes.get('/u/login', (req, res) => {
    res.send('(Login Input Here)')
});
/*
userRoutes.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    //Google Authentication dayon
    ...
    ...
    if (username === 'username' && password === 'password') {
        res.send('Login successful');
    } else {
        res.send('Invalid username or password');
    }
});
*/


//Events
userRoutes.get('/u/events', (req,res) => {
    res.send('List of events page');
});

//Open an event
userRoutes.get('/u/events/:id', (req,res) => {
    res.send('COT Mental Health Awareness');
    res.send('Register Button');
});

//Registration and Attendance of an event
userRoutes.get('/u/events/:id/reg&att', (req,res) => {
    res.send('Attendance');
});

//Calendar with Google Calendar API
userRoutes.get('/u/calendar', (req,res) => {
    res.send('Calendar Page');
});

//User Profile Page
userRoutes.get('/u/profile', (req,res) => {
    res.send('Profile Page')
});

//User Certificates Page
userRoutes.get('/u/certificate', (req,res) => {
    res.send('certificates')
});
userRoutes.get('/u/certificate/:certificateID', (req, res) => {

});
//history page
userRoutes.get('/u/history', (req, res) =>{

});
userRoutes.get('/u/history/:eventID', (req, res) =>{

});

//Notification
userRoutes.get('/u/notification', (req, res) => {

});

//Events


module.exports = userRoutes;