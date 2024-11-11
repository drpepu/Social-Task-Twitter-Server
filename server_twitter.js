require('dotenv').config();
const express = require('express');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const axios = require('axios');
const session = require('express-session');
const OAuth = require('oauth').OAuth;

const app = express();
const PORT = 4000;

// Middleware
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY,  // Store these in your .env file
    consumerSecret: process.env.TWITTER_API_SECRET,  // Store these in your .env file
    callbackURL: 'http://localhost:4000/auth/twitter/callback'
}, (token, tokenSecret, profile, done) => {
    // Store the user info and tokens in session
    return done(null, { profile, token, tokenSecret });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Check if user follows the DrPepeAI account
async function checkIfUserFollows(authenticatedUserId, token, tokenSecret) {
    try {
        const oauth = new OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            process.env.TWITTER_API_KEY,  // Add your consumer key
            process.env.TWITTER_API_SECRET,  // Add your consumer secret
            '1.0A',
            null,
            'HMAC-SHA1'
        );

        // Make an authenticated API call using the OAuth tokens
        oauth.get(
            `https://api.twitter.com/1.1/followers/ids.json?user_id=${authenticatedUserId}`,
            token,  // OAuth token
            tokenSecret,  // OAuth token secret
            (err, data, response) => {
                if (err) {
                    console.error('Error fetching follower data:', err);
                    return false;
                }
                const followers = JSON.parse(data);
                const isFollowing = followers.ids.includes('1824457453616107524');  // DrPepeAI user ID
                return isFollowing;
            }
        );
    } catch (error) {
        console.error('Error checking follower status:', error);
        return false;
    }
}

// Routes
app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), async (req, res) => {
    try {
        const { profile, token, tokenSecret } = req.user;

        // Check if the user follows DrPepeAI account
        const isFollowing = await checkIfUserFollows(profile.id, token, tokenSecret);

        if (isFollowing) {
            res.json({
                message: 'You are following DrPepeAI!',
                user: profile,
                isFollowing: true,
            });
        } else {
            res.json({
                message: 'You are not following DrPepeAI.',
                user: profile,
                isFollowing: false,
            });
        }
    } catch (error) {
        console.error('Error during the callback processing:', error);
        res.status(500).send('Error processing the callback');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
