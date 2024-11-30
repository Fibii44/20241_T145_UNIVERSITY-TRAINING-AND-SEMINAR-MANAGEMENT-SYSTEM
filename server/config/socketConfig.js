const socketIO = require('socket.io');
const ActivityLog = require('../models/activityLog');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "http://localhost:5000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
};

const emitNewActivity = async (userId, action, details = {}) => {
    try{
        const activityLog = new ActivityLog({ userId, action, details });
        await activityLog.save();

        if(io){
            io.emit('newActivity', {
                userId,
                action,
                details,
                timestamp: new Date()
            });
        }
    }catch(error){
        console.error('Error emitting new activity:', error);
    }
};

module.exports = { initializeSocket, emitNewActivity };
