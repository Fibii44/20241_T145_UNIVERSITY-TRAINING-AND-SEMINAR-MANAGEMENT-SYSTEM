const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const User = require('../models/user');

dotenv.config();

const scopes = [
    'profile', 
    'email', 
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.send',
]

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    scope: scopes,
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Try finding the user by googleId first
        let user = await User.findOne({ googleId: profile.id });

        // If no user found with googleId, search for user by email
        if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                // Link Google account to existing user by updating googleId
                user.googleId = profile.id;
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
                if (!user.profilePicture || user.profilePicture !== profile.photos[0].value) {
                    user.profilePicture = profile.photos[0].value;
                }
            } else {
                // No user found by googleId or email, create a new user
                user = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value,
                    role: 'faculty_staff',  // Default role
                    accessToken,
                    refreshToken
                });
            }
            await user.save();
        } else {
            // Update tokens for existing Google user
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

// Serialize user to store in session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});

module.exports = passport;
