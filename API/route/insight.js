import express from 'express';
import {  getInsightsAndSave, getInsights, getFilteredInsights,  getFacebookAccGrowthAnalytics, deleteInsights, FbProfile } from '../Controller/insight.js';
import { getContentData, getContentPerformance, getFilteredContentInsights, getTop5FacebookPosts, performenceDelete } from '../Controller/Performence.js';
import { getAdInsights, getAdInsightsData, getFilteredAdsInsights } from '../Controller/AdsInsight.js';
import { Authenticated } from '../Middlewares/auth.js';



const router = express.Router();

router.get("/fetch",Authenticated, getInsightsAndSave);
router.get("/data",Authenticated, getInsights)
router.get("/filter", Authenticated, getFilteredInsights);
router.get("/filter/Acc/growth", Authenticated, getFacebookAccGrowthAnalytics)
router.get("/fb_Profile", Authenticated, FbProfile)


//  Ads route
router.get("/ads", Authenticated, getAdInsights); 
router.get("/ads/data",  Authenticated, getAdInsightsData);
router.get("/ads/filter", Authenticated,  getFilteredAdsInsights)

//Content Performance
router.get("/content", Authenticated, getContentPerformance); 
router.get("/content/data",  Authenticated, getContentData);
router.get("/filter/post",   Authenticated, getFilteredContentInsights);
router.get("/filter/topPost",Authenticated,getTop5FacebookPosts)





// // delete model data
router.delete("/content",performenceDelete)
//delete page Insight data
router.delete("/data",deleteInsights);

export default router;
