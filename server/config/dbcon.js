const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected Successfully')
    }catch (err) {
        console.error('MongoDB connection Failed', err.message)
        process.exit(1)
    }
}
module.exports = connectDB; 