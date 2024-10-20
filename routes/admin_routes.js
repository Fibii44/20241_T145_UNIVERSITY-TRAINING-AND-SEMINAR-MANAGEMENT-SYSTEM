const express = require('express');
const app = express();

//Landing Page
app.get('/', (req, res) => {
    res.send('Landing Page')
})

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


//Dashboard
app.get('/dashboard', (req,res) => {
    res.send('Dashboard');
});
//Events Page
app.get('/events', (req,res) => {
    res.send('List of events page');
});
//Add and Manage an event
app.post('/events/', (req,res) => {
    res.send('(Inputs)');
});
//View an event
app.get('/events/:id')
//Add Personnel Account
app.post('/accounts', (req,res) => {
    res.send('(Input User Info)');
});
//Calendar with Google Calendar API
app.get('/calendar', (req,res) => {
    res.send('Calendar Page Management');
});
//Admin Profile Page
app.get('/profile', (req,res) => {
    res.send('Profile Page')
});
//Recent Events or History of Events
app.get('/history', (req,res) => {
    res.send('list of finishes events')
});
//Reports Generation of each events
app.get('/history/:eventID', (req,res) => {
    res.send('Analystics and Dashboard')
});
app.listen(3000);