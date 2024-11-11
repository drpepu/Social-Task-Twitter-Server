require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = 4000;

// Enable CORS for all routes
app.use(cors());

// Endpoint to get Twitter account info with additional fields
app.get('/api/twitter-account', async (req, res) => {
    try {
        const response = await axios.get('https://api.twitter.com/2/users/by/username/drpepeai', {
            headers: {
                Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAAKF%2BwwEAAAAA%2FWcGPizOb553bRdSIFapTsShn0s%3D3rdIOwxIrqSvw1FGgnICnzEt69cOO7aDmB8Oh9DUTqd4HxXLgt`
            },
            params: {
                'user.fields': 'created_at,description,location,profile_image_url,public_metrics,verified'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching Twitter account info:', error);
        res.status(500).send('Error fetching Twitter account info');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
