
import axios from "axios";
import IgAdInsight from '../../Model/Instagram/IgAdInsight.js'
import FbPage from "../../Model/FbPage.js";
import User from "../../Model/User.js";

export const getIgAd = async (req, res) => {
  const userId = req.user.id;

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const date_start = sevenDaysAgo.toISOString().split("T")[0];
  const date_stop = today.toISOString().split("T")[0];

  try {
    const fbPages = await FbPage.find({ userId });
    if (!fbPages.length) {
      return res.status(404).json({ error: "No pages found for this user" });
    }

    const userPage = await User.findById(userId);
    if (!userPage || !userPage.facebook_token) {
      return res.status(404).json({ error: "User access token not found" });
    }
    const ACCESS_TOKEN = userPage.facebook_token;

    const allInsights = [];
    for (const page of fbPages) {
      const igUserId = page.instagram_user_id;

      // 1. Get the ad account ID
      const { data: adAccountData } = await axios.get("https://graph.facebook.com/v19.0/me/adaccounts", {
        params: { access_token: ACCESS_TOKEN },
      });

      const adAccountId = adAccountData.data?.[0]?.id;
      if (!adAccountId) {
        console.warn(`No ad account for page: ${igUserId}`);
        continue;
      }
      // 2. Fetch ad-level insights (no breakdowns)
      const { data: insightData } = await axios.get(
        `https://graph.facebook.com/v19.0/${adAccountId}/insights`,
        {
          params: {
            access_token: ACCESS_TOKEN,
            fields: "ad_id,adset_id,adset_name,campaign_id,campaign_name,date_start,date_stop,spend,impressions,reach,cpc,ctr",
            level: "ad",
            time_range: JSON.stringify({
              since: date_start,
              until: date_stop,
            }),
          },
        }
      );

      const insights = insightData.data || [];

      // 3. Store in DB
      for (const insight of insights) {
        const {
          ad_id,
          adset_id,
          adset_name,
          campaign_id,
          campaign_name,
          date_start,
          date_stop,
          ...rawMetrics
        } = insight;

        const metricsMap = new Map(Object.entries(rawMetrics));

        await IgAdInsight.updateOne(
          {
            userId,
            ig_user_id: igUserId,
            ad_account_id: adAccountId,
            ad_id,
            date_start: new Date(date_start),
            date_stop: new Date(date_stop),
          },
          {
            $set: {
              campaign_id,
              campaign_name,
              adset_id,
              adset_name,
              metrics: metricsMap,
            },
          },
          { upsert: true }
        );
      }
      allInsights.push(...insights);
    }
    res.status(200).json({
      message: "Instagram Ad Insights fetched and stored successfully",
      total: allInsights.length,
      insights: allInsights,
    });
  } catch (error) {
    console.error("Error in getIgAd:", error.message);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};





//Filter
export const getFilteredIgAd = async (req, res) => {
  const userId = req.user.id;
  try {
    const { type, value, start, end, ad_account_id, campaign_id, page_id } = req.query;
    let filter = { userId };

    // Optional filters
    if (ad_account_id) filter.ad_account_id = ad_account_id;
    if (campaign_id) filter.campaign_id = campaign_id;

    if (page_id) {
      const page = await Page.findOne({ page_id, userId });
      if (!page) {
        return res.status(404).json({ error: 'Page not found for the given page_id' });
      }
      filter.ig_user_id = page.ig_user_id;
    }

    // Validate inputs
    if (type === 'day' && !value) {
      return res.status(400).json({ error: 'Missing "value" for day type (expected YYYY-MM-DD)' });
    }
    if (type === 'month' && (!value || !value.includes('-'))) {
      return res.status(400).json({ error: 'Missing or invalid "value" for month type (expected YYYY-MM)' });
    }
    if (type === 'year' && !value) {
      return res.status(400).json({ error: 'Missing "value" for year type (expected YYYY)' });
    }
    if (type === 'range' && (!start || !end)) {
      return res.status(400).json({ error: 'Missing "start" or "end" for range type' });
    }

    // Date filters applied on date_stop field
    switch (type) {
      case 'day': {
        const day = new Date(value);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        filter.date_stop = { $gte: day, $lt: nextDay };
        break;
      }
      case 'month': {
        const [year, month] = value.split('-');
        const startMonth = new Date(year, month - 1, 1);
        const endMonth = new Date(year, month, 0, 23, 59, 59);
        filter.date_stop = { $gte: startMonth, $lte: endMonth };
        break;
      }
      case 'year': {
        const yearStart = new Date(`${value}-01-01T00:00:00`);
        const yearEnd = new Date(`${value}-12-31T23:59:59`);
        filter.date_stop = { $gte: yearStart, $lte: yearEnd };
        break;
      }
      case 'range': {
        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        filter.date_stop = { $gte: startDate, $lte: endDate };
        break;
      }
      case 'last7days': {
        const today = new Date();
        const pastWeek = new Date();
        pastWeek.setDate(today.getDate() - 6);
        filter.date_stop = {
          $gte: new Date(pastWeek.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
        break;
      }
      case 'last30days': {
        const today = new Date();
        const past30 = new Date();
        past30.setDate(today.getDate() - 29);
        filter.date_stop = {
          $gte: new Date(past30.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
        break;
      }
      case 'currentMonth': {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        filter.date_stop = { $gte: startOfMonth, $lte: endOfMonth };
        break;
      }
      default: {
        const today = new Date();
        const pastWeek = new Date();
        pastWeek.setDate(today.getDate() - 6);
        filter.date_stop = {
          $gte: new Date(pastWeek.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
      }
    }

    const insights = await IgAdInsight.find(filter).sort({ date_stop: -1 });
    if (!insights.length) {
      return res.status(404).json({ message: 'No data found for the selected filter.' });
    }

    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};