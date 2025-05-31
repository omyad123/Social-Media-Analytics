import axios from "axios";
import "dotenv/config";
import Insight from "../Model/Insight.js";
import cron from "node-cron";
import { getPeriodDates } from "../utils/getPeriodDates.js";
import User from "../Model/User.js";
import FbPage from "../Model/FbPage.js";


export const getInsightsAndSave = async (req, res) => {
  const userId = req.user.id;
  let user = await User.findById(userId);
  const UserFacebookToken = user.facebook_token;
  // 1. Fetching page data from Facebook API
  try {
    const pageRes = await axios.get(
      `https://graph.facebook.com/v17.0/me/accounts?access_token=${UserFacebookToken}`
    );
    const pages = pageRes?.data?.data;
    if (Array.isArray(pages) && pages.length > 0) {
      for (const page of pages) {
        const { id: page_Id, name: page_name, access_token: page_token } = page;

        const pictureRes = await axios.get(
          `https://graph.facebook.com/v17.0/${page_Id}/picture`,
          {
            params: {
              access_token: page_token,
              redirect: false,
              type: 'small'
            }
          }
        );
        const Fb_profile_url = pictureRes?.data?.data?.url || null;

        const PageData = await FbPage.updateOne(
          { userId, page_Id },
          {
            $set: {
              userId,
              page_Id,
              page_name,
              page_token,
              Fb_profile_url
            },
          },
          { upsert: true }
        );

        console.log("Page data saved/updated successfully.", PageData);
      }
    } else {
      console.log("No page data found from Facebook API.");
    }
  } catch (err) {
    console.error("Error fetching/saving page data:", err.message);
    return res.status(500).json({ error: "Failed to fetch/save page data" });
  }
  // 2. Fetch insights for saved pages
  try {
    const userPages = await FbPage.find({ userId });

    if (!userPages || userPages.length === 0) {
      return res.status(404).json({ error: "No pages found for this user" });
    }

    const metrics = [
      "page_fans",
      "page_fan_adds",
      "page_fan_removes",
      "page_daily_follows",
      "page_impressions_unique",
      "page_impressions",
      "page_views_total",
      "page_post_engagements",
      "page_actions_post_reactions_total",
      "page_posts_impressions_paid",
      "page_posts_impressions_organic",
      "page_posts_impressions_unique",
      "page_posts_impressions",
    ];
    const demographicMetrics = ["page_fans_city", "page_fans_country", "page_fans_gender_age"];
    const now = new Date();
    const istMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayTimestamp = Math.floor((istMidnight.getTime() - 19800 * 1000) / 1000);

    const past90Date = new Date(now);
    past90Date.setDate(past90Date.getDate() - 90);
    const sinceDay = Math.floor((past90Date.getTime() - 19800 * 1000) / 1000);
 

    for (const userPage of userPages){
      const pageId = userPage.page_Id;
      const PageaccessToken = userPage.page_token;

      try {
        const url = `https://graph.facebook.com/v17.0/${pageId}/insights?metric=${metrics.join(',')}&period=day&since=${sinceDay}&until=${todayTimestamp}&access_token=${PageaccessToken}`;
        const { data } = await axios.get(url);

        if (!data?.data) continue;

        for (const metricData of data.data) {
          const metricName = metricData.name;
          const period = metricData.period;
          const description = metricData.description || "";

          for (const entry of metricData.values) {
            const rawValue = entry.value;
            const endTime = new Date(entry.end_time);

            if (
              rawValue === null ||
              rawValue === undefined ||
              (typeof rawValue === "object" && Object.keys(rawValue).length === 0)
            )
              continue;

            await Insight.updateOne(
              {
                userId,
                page_id: pageId,
                metric: metricName,
                end_time: endTime,
              },
              {
                $set: {
                  value: rawValue,
                  period,
                  description,
                },
              },
              { upsert: true }
            );
          }
        }

        // Fetch demographic metrics
        for (const demoMetric of demographicMetrics) {
          try {
            const demoUrl = `https://graph.facebook.com/v17.0/${pageId}/insights?metric=${demoMetric}&period=lifetime&access_token=${PageaccessToken}`;
            const demoRes = await axios.get(demoUrl);

            for (const metricData of demoRes?.data?.data || []) {
              const metricName = metricData.name;
              const period = metricData.period;
              const description = metricData.description || "";

              for (const entry of metricData.values) {
                const rawValue = entry.value;
                const endTime = new Date(entry.end_time);

                if (
                  rawValue === null ||
                  rawValue === undefined ||
                  (typeof rawValue === "object" && Object.keys(rawValue).length === 0)
                )
                  continue;

                await Insight.updateOne(
                  {
                    userId,
                    page_id: pageId,
                    metric: metricName,
                    end_time: endTime,
                  },
                  {
                    $set: {
                      value: rawValue,
                      period,
                      description,
                    },
                  },
                  { upsert: true }
                );
              }
            }
          } catch (err) {
            console.warn(
              `Skipped demographic metric ${demoMetric} for page ${pageId}: ${err?.response?.data?.error?.message}`
            );
            continue;
          }
        }
        console.log(` Stored insights for page: ${pageId}`);
      } catch (error) {
        console.error(` Error fetching insights for page ${pageId}:`, error?.response?.data || error.message);
      }
    }
    return res.json({ success: true, message: "Insights fetched and stored for all pages" });
  } catch (err) {
    console.error("Error fetching/storing insights:", err.message);
    return res.json({ error: "Failed to fetch/store insights" });
  }
}; 


cron.schedule("0 18 * * *", async () => {
  console.log("Runnoing cron job to fetch insights At 12:00 AM IST");
  await getInsightsAndSave();
},
  { timezone: "Asia/Kolkata" }
)


// Get data of Insights
export const getInsights = async (req, res) => {
  const userId = req.user.id;
  try {
    const data = await Insight.find({ userId });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get all Facebook Pages connected to a user
export const FbProfile = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID not found" });
  }
  try {
    // Fetch all pages linked to the user
    const profilePages = await FbPage.find({ userId });
    if (!profilePages || profilePages.length === 0) {
      return res.status(404).json({ message: "No Facebook pages found for this user" });
    }
    const formattedPages = profilePages.map(page => ({
      page_Id: page.page_Id,
      page_name: page.page_name,
      Fb_profile_url: page.Fb_profile_url,
      page_token: page.page_token, 
    }));
    res.status(200).json({ data: formattedPages });
  } catch (err) {
    console.error("Error fetching Facebook pages:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



// FILTER Insigts
export const getFilteredInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, value, start, end, pageId } = req.query;
    
    let filter = { userId };
    if (pageId && pageId.trim() !== '') {
      filter.page_id = pageId.toString();
    }
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

    // Date filtering
    switch (type) {
      case 'day': {
        const day = new Date(value);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        filter.end_time = { $gte: day, $lt: nextDay };
        break;
      }

      case 'month': {
        const [year, month] = value.split('-');
        const startMonth = new Date(year, month - 1, 1);
        const endMonth = new Date(year, month, 0, 23, 59, 59);
        filter.end_time = { $gte: startMonth, $lte: endMonth };
        break;
      }

      case 'year': {
        const yearStart = new Date(`${value}-01-01T00:00:00`);
        const yearEnd = new Date(`${value}-12-31T23:59:59`);
        filter.end_time = { $gte: yearStart, $lte: yearEnd };
        break;
      }

      case 'range': {
        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        filter.end_time = { $gte: startDate, $lte: endDate };
        break;
      }

      case 'last7days': {
        const today = new Date();
        const pastWeek = new Date();
        pastWeek.setDate(today.getDate() - 6);
        filter.end_time = {
          $gte: new Date(pastWeek.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
        break;
      }

      case 'last30days': {
        const today = new Date();
        const past30 = new Date();
        past30.setDate(today.getDate() - 29);
        filter.end_time = {
          $gte: new Date(past30.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
        break;
      }

      case 'currentMonth': {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        filter.end_time = { $gte: startOfMonth, $lte: endOfMonth };
        break;
      }

      default: {
        const today = new Date();
        const pastWeek = new Date();
        pastWeek.setDate(today.getDate() - 6);
        filter.end_time = {
          $gte: new Date(pastWeek.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
        break;
      }
    }
    const insights = await Insight.find(filter).sort({ end_time: 1 });
    if (!insights || insights.length === 0) {
      return res.status(404).json({ message: 'No data found for the selected filter.' });
    }
    res.status(200).json(insights);
  } catch (error) {
    console.error("Error in getFilteredInsights:", error.message);
    res.status(500).json({ error: error.message });
  }
};




///******* DELETE ALL DATA */

export const deleteInsights = async (req, res) => {
  await Insight.deleteMany();
  res.json({ success: true });
}



// growth calculation
export const getFacebookAccGrowthAnalytics = async (req, res) => {
  const userId = req.user.id;
  try {
    const { type, value, start, end } = req.query;

    const { startCurrent, endCurrent, startPrevious, endPrevious } = getPeriodDates(type, value, start, end);

    const metrics = [
      "page_fans",                  // Total page likes
      "page_fan_adds",             // New fans added
      "page_impressions_unique",   // Reach
      "page_impressions",
      "page_views_total"
    ];

    const baseFilter = {
      userId,                      // Always filter by logged-in user
      metric: { $in: metrics }
    };

    const currentFilter = {
      ...baseFilter,
      end_time: { $gte: startCurrent, $lte: endCurrent }
    };

    const previousFilter = {
      ...baseFilter,
      end_time: { $gte: startPrevious, $lte: endPrevious }
    };

    const currentData = await Insight.find(currentFilter);
    const previousData = await Insight.find(previousFilter);

    const sumByMetric = (data) => {
      const sum = {};
      for (const metric of metrics) {
        sum[metric] = data
          .filter((entry) => entry.metric === metric)
          .reduce((acc, cur) => acc + (cur.value || 0), 0);
      }
      return sum;
    };

    const currentSums = sumByMetric(currentData);
    const previousSums = sumByMetric(previousData);

    const result = metrics.map((metric) => {
      const current = currentSums[metric] || 0;
      const previous = previousSums[metric] || 0;
      const growth = previous
        ? (((current - previous) / previous) * 100).toFixed(2)
        : "N/A";
      return {
        metric,
        current,
        previous,
        growth: `${growth}%`
      };
    });

    res.status(200).json({ data: result });

  } catch (err) {
    console.error("Growth Analytics Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};















