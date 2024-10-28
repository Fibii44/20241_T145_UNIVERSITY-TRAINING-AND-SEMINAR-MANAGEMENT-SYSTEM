const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const User = require('../models/user');

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
    try{
        let user = await User.findOne({ googleId: profile.id});

        if(!user){
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                profilePhoto: profile.photos[0].value,
                role: 'faculty_staff'
            });
            await user.save();
        }
        return done(null, user);
    }catch(error){
        return done(error, false);
    }
}
));

//Serialize user to store in session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

//Deserialize user from session
passport.deserializeUser(async(id, done) => {
    try{
        const user = await User.findById(id)
        done(null, user);
    }catch(error){
        done(error, false);
    }
});

module.exports = passport;