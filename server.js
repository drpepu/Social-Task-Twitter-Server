const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();  

const app = express();
const port = process.env.PORT || 4000;



app.use(cors());


const BEARER_TOKEN = process.env.BEARER_TOKEN;

app.get('/check-follow-status', async (req, res) => {
  const { username } = req.query; 

  try {
 
    const userResponse = await axios.get(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      }
    );
    const userId = userResponse.data.data.id;


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
