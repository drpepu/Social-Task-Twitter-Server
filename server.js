const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 5000;

// Use CORS to allow frontend access
app.use(cors());

// Define your Bearer token
const BEARER_TOKEN = process.env.BEARER_TOKEN;

app.get('/check-follow-status', async (req, res) => {
  const { username } = req.query; // Get the username from the query parameter

  try {
    // Get the user ID by username
    const userResponse = await axios.get(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      }
    );
    const userId = userResponse.data.data.id;

    // Check if the user follows the target account (drpepeai)
    const followResponse = await axios.get(
      `https://api.twitter.com/2/users/${userId}/following`,
      {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      }
    );

    const isFollowing = followResponse.data.data.some(
      (user) => user.username === 'drpepeai'
    );

    res.json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Error checking follow status' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
