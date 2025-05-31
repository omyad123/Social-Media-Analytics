import axios from "axios";
import AdsInsight from "../Model/AdsInsight.js";
import FbPage from "../Model/FbPage.js";
import User from "../Model/User.js";


export const getAdInsights = async (req, res) => {
  const userId = req.user.id;

  try {

     const user = await User.findById(userId);
    if (!user || !user.facebook_token) {
      return res.status(404).json({ error: "User or access token not found" });
    }
    const access_token = user.facebook_token; 

    // 1. Fetch all pages associated with the user
    const fbPages = await FbPage.find({ userId });
    if (!fbPages.length) {
      return res.status(404).json({ error: "No pages found for this user" });
    }
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const date_start = sevenDaysAgo.toISOString().split("T")[0];
    const date_stop = today.toISOString().split("T")[0];

    const fields = [
      "ad_id",
      "adset_id",
      "campaign_id",
      "impressions",
      "reach",
      "clicks",
      "spend",
      "ctr",
      "cpc",
      "cpm"
    ];

    const campaignNameCache = {};
    const adsetNameCache = {};

    let totalSaved = 0;

    for (const page of fbPages) {
      const page_id = page.page_Id;
      const ad_account_id = page.ad_account_id?.replace("act_", "");
      if (!access_token || !ad_account_id) {
        console.warn(`Skipping page ${page_id} due to missing token or ad_account_id`);
        continue;
      }

      const url = `https://graph.facebook.com/v19.0/act_${ad_account_id}/insights`;

      const { data } = await axios.get(url, {
        params: {
          level: "ad",
          fields: fields.join(","),
          access_token,
          time_range: JSON.stringify({
            since: date_start,
            until: date_stop,
          }),
        },
      });

      const insights = data.data;

      for (const row of insights) {
        let campaign_name = "";
        let adset_name = "";

        // Campaign Name with cache
        if (row.campaign_id) {
          if (campaignNameCache[row.campaign_id]) {
            campaign_name = campaignNameCache[row.campaign_id];
          } else {
            try {
              const campRes = await axios.get(
                `https://graph.facebook.com/v19.0/${row.campaign_id}`,
                {
                  params: { access_token, fields: "name" },
                }
              );
              campaign_name = campRes.data.name;
              campaignNameCache[row.campaign_id] = campaign_name;
            } catch (err) {
              console.warn(`Error fetching campaign name for ${row.campaign_id}`);
            }
          }
        }
        // Adset Name with cache
        if (row.adset_id) {
          if (adsetNameCache[row.adset_id]) {
            adset_name = adsetNameCache[row.adset_id];
          } else {
            try {
              const adsetRes = await axios.get(
                `https://graph.facebook.com/v19.0/${row.adset_id}`,
                {
                  params: { access_token, fields: "name" },
                }
              );
              adset_name = adsetRes.data.name;
              adsetNameCache[row.adset_id] = adset_name;
            } catch (err) {
              console.warn(`Error fetching adset name for ${row.adset_id}`);
            }
          }
        }

        // Build the record
        const metricsMap = new Map();
        for (const metric of fields) {
          if (row[metric] !== undefined) {
            metricsMap.set(metric, row[metric]);
          }
        }

        const record = {
          userId,
          page_id,
          ad_account_id,
          ad_id: row.ad_id,
          adset_id: row.adset_id,
          adset_name: adset_name || null,
          campaign_id: row.campaign_id,
          campaign_name: campaign_name || null,
          metrics: metricsMap,
          date_start: new Date(date_start),
          date_stop: new Date(date_stop),
        };

        // Save to DB
        await AdsInsight.updateOne(
          {
            ad_id: record.ad_id,
            date_start: record.date_start,
            date_stop: record.date_stop,
          },
          { $set: record },
          { upsert: true }
        );
        totalSaved++;
      }
    }
    return res.status(200).json({
      message: "Ads insights fetched and saved for all pages",
      count: totalSaved,
    });
  } catch (err) {
    console.error("Ads Insights Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch Ads insights" });
  }
};

// ------------------filter ads data

export const getFilteredAdsInsights = async (req, res) => {
  const userId = req.user.id;

  try {
    const { type, value, start, end, page_id } = req.query;
    let timeFilter = {};

    // Validation
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

    // Filter logic
    switch (type) {
      case 'day': {
        const day = new Date(value);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        timeFilter = { $gte: day, $lt: nextDay };
        break;
      }
      case 'month': {
        const [year, month] = value.split('-');
        const startMonth = new Date(year, month - 1, 1);
        const endMonth = new Date(year, month, 0, 23, 59, 59);
        timeFilter = { $gte: startMonth, $lte: endMonth };
        break;
      }
      case 'year': {
        const yearStart = new Date(`${value}-01-01T00:00:00`);
        const yearEnd = new Date(`${value}-12-31T23:59:59`);
        timeFilter = { $gte: yearStart, $lte: yearEnd };
        break;
      }
      case 'range': {
        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        timeFilter = { $gte: startDate, $lte: endDate };
        break;
      }
      case 'last7days': {
        const today = new Date();
        const pastWeek = new Date();
        pastWeek.setDate(today.getDate() - 6);
        timeFilter = {
          $gte: new Date(pastWeek.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999)),
        };
        break;
      }
      case 'last30days': {
        const today = new Date();
        const past30 = new Date();
        past30.setDate(today.getDate() - 29);
        timeFilter = {
          $gte: new Date(past30.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999)),
        };
        break;
      }
      case 'currentMonth': {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        timeFilter = { $gte: startOfMonth, $lte: endOfMonth };
        break;
      }
      default: {
        const today = new Date();
        const pastWeek = new Date();
        pastWeek.setDate(today.getDate() - 6);
        timeFilter = {
          $gte: new Date(pastWeek.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999)),
        };
      }
    }
    const filter = {
      userId,
      date_start: { $gte: timeFilter.$gte },
      date_stop: { $lte: timeFilter.$lte },
    };

    // Optional page-level filter
    if (page_id) {
      filter.page_id = page_id;
    }

    const adsInsights = await AdsInsight.find(filter).sort({ date_start: 1 });

    if (!adsInsights || adsInsights.length === 0) {
      return res.status(404).json({ message: 'No ad insights found for selected filter.' });
    }

    res.status(200).json(adsInsights);
  } catch (error) {
    console.error("Error fetching ads insights:", error);
    res.status(500).json({ error: error.message });
  }
};







// get ad data
export const getAdInsightsData = async (req, res) => {
  const data = await AdsInsight.find()
  res.json(data);
}
