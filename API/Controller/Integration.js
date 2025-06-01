import express from 'express'
import axios from 'axios'
import User from '../Model/User.js';
import { Authenticated } from '../Middlewares/auth.js';


// -------------------------------------------- FOR FACEBOOK----------------------

// routes/facebook.js

const router = express.Router();

const CLIENT_ID = '1188008382709475';
const CLIENT_SECRET = 'df33a7bf166c4508801493df712744fe';
const REDIRECT_URI = 'https://omnidash.live/auth/facebook/callback';
const REDIRECT_URI_insta = 'https://omnidash.live/auth/instagram/callback';

// STEP 1: Exchange code for short-lived access token
router.post('/exchange-code',Authenticated, async (req, res) =>{
  console.log('Received request to /exchange-code with body:', req.body);
  const { code, platform } = req.body;
  const userId = req.user.id;
  try {
    const redirectUri = platform === 'instagram' ? REDIRECT_URI_insta : REDIRECT_URI;
    const tokenRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,   
        redirect_uri: redirectUri,
        code,
      },
    }); 

    const shortLivedToken = tokenRes.data.access_token;


    // STEP 2: Exchange for long-lived token
    const longTokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    });

    const longLivedToken = longTokenRes.data.access_token;
    //save to db
    const user = await User.findById(userId);
    user.facebook_token = longLivedToken;
    user.facebook_token_expires_at = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
    await user.save();

    res.json({ access_token: longLivedToken });

  } catch (err) {
    console.error("Error exchanging code:", err.response?.data || err.message);
    res.status(500).json({ error: "Token exchange failed" });
  }
});


export default router;
