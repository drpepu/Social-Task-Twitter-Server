const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qs = require('qs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Step 1: Get OAuth2 Token
const getOAuth2Token = async () => {
  const auth = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await axios.post(
      'https://api.twitter.com/oauth2/token',
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching OAuth2 token:', error);
    throw new Error('Failed to get access token');
  }
};

// Step 2: Check if a user follows a specific Twitter account
const checkFollowStatus = async (accessToken, userId, targetUsername) => {
  try {
    const response = await axios.get(
      `https://api.twitter.com/2/users/${userId}/following`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          'user.fields': 'id,username', 
        },
      }
    );
    
    const isFollowing = response.data.data.some(user => user.username === targetUsername);
    return isFollowing;
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw new Error('Failed to check follow status');
  }
};

// Step 3: API Endpoint to Check Follow Status
app.post('/check-follow-status', async (req, res) => {
  const { userId, targetUsername } = req.body;
  
  if (!userId || !targetUsername) {
    return res.status(400).json({ error: 'userId and targetUsername are required' });
  }

  try {
    const accessToken = await getOAuth2Token();
    const isFollowing = await checkFollowStatus(accessToken, userId, targetUsername);
    
    return res.json({ isFollowing });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
