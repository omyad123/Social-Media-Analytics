import express from 'express'
import { deleteInstaAccInsight, fetchDemographics, fetchIgAcc, getAccIgGrowthAnalytics, getDemographics, getFilteredIgAcc, getIgAcc, InstaProfile, } from '../Controller/instagram/IgAccInsight.js';
import {  deletePost, getIgPostData, getPostFilteredbyreach, getTop5Post, IgPostData} from '../Controller/instagram/IgPostInsight.js';
import { getFilteredIgStory, getStory } from '../Controller/instagram/IgStoryInsight.js';
import { getFilteredIgAd, getIgAd } from '../Controller/instagram/IgAdInsight.js';
import { Authenticated } from '../Middlewares/auth.js';




const router = express.Router();

// IgAccInsights
router.get("/fetch",  Authenticated, fetchIgAcc)
router.get("/data", Authenticated,  getIgAcc);
router.get("/filter/Acc",  Authenticated, getFilteredIgAcc)
router.get("/filter/Acc/growth", Authenticated,  getAccIgGrowthAnalytics)
router.get("/insta_Profile", Authenticated, InstaProfile)
router.get("/demographics",Authenticated, fetchDemographics)
router.get("/demographics/data", Authenticated, getDemographics);

//Ig Post Insights
router.get("/post", Authenticated,  IgPostData);
router.get("/post/data", Authenticated,  getIgPostData)
router.get("/filter/post",  Authenticated,  getTop5Post)
router.get("/filter/post/reach",  Authenticated,  getPostFilteredbyreach);

//IG Story Insights
router.get("/story",  Authenticated,  getStory);
router.get("/filter/story",   Authenticated,  getFilteredIgStory)
// IG Ads Insights 
router.get("/ads", Authenticated, getIgAd);
router.get("/filter/ads",   Authenticated,  getFilteredIgAd)





//DELETE
router.delete("/data",deleteInstaAccInsight)
router.delete("/post/delete",deletePost);

export default router