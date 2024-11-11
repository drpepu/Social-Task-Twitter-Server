require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const TwitterStrategy = require('passport-twitter').Strategy;

const app = express();
const PORT = 4000;


app.use(session({
  secret: 'your-secret-key',  
  resave: false,
  saveUninitialized: true
}));

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_API_KEY,
  consumerSecret: process.env.TWITTER_API_SECRET,
  callbackURL: 'http://localhost:4000/auth/twitter/callback'  
}, (token, tokenSecret, profile, done) => {

  return done(null, { profile, token, tokenSecret });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));


app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), (req, res) => {

  res.json({ message: 'Authentication successful!', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
