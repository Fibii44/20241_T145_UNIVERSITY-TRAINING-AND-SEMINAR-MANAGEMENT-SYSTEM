const express = require('express');
const app = express();

//Landing Page
app.get('/', (req,res) => {
    res.send('Landing Page');
});

//Login Page
app.get('/login', (req, res) => {
    res.send('(Login Input Here)')
});
/*
app.post('/login', (req, res) => {
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
app.get('/events', (req,res) => {
    res.send('List of events page');
});
//Open an event
app.get('/events/:id', (req,res) => {
    res.send('COT Mental Health Awareness');
    res.send('Register Button');
});
//Registration and Attendance of an event
app.get('/events/:id/reg&att', (req,res) => {
    res.send('Attendance');
});
//Calendar with Google Calendar API
app.get('/calendar', (req,res) => {
    res.send('Calendar Page');
});
//User Profile Page
app.get('/profile', (req,res) => {
    res.send('Profile Page')
});
//User Certificates Page
app.get('/certificate', (req,res) => {
    res.send('certificates')
});
app.get('/certificate/:certificateID', (req, res) => {

});
//history page
app.get('/history', (req, res) =>{

});
app.get('/history/:eventID', (req, res) =>{

});
//Notification
app.get('/notification', (req, res) => {

});

app.listen(3000);