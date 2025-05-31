
import axios from "axios";
import IgAccInsight from "../../Model/Instagram/IgAccInsight.js";
import { getPeriodDates } from "../../utils/getPeriodDates.js";
import User from "../../Model/User.js";
import FbPage from "../../Model/FbPage.js";
import IgDemographic from "../../Model/Instagram/igDemographic.js";


export const fetchIgAcc = async (req, res) => {
  const userId = req.user.id;
  let user = await User.findById(userId);
  const UserFacebookToken = user.facebook_token;
  console.log("acesss token of viom for insta ---", UserFacebookToken);

  try {
    if (!user) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Fetching page data and user_Id from Instagram API
    const fbPagesRes = await axios.get(
      `https://graph.facebook.com/v18.0/me/accounts`,
      { params: { access_token: UserFacebookToken } }
    );

    const fbPages = fbPagesRes.data.data;
    for (const page of fbPages) {
      const { id: page_Id, access_token: page_token } = page;

      // Get Instagram business account connected to this page
      const igRes = await axios.get(
        `https://graph.facebook.com/v18.0/${page_Id}`,
        {
          params: {
            fields: "instagram_business_account",
            access_token: page_token,
          },
        }
      );

      const igData = igRes.data.instagram_business_account;

      if (igData?.id) {
        const instagram_user_id = igData.id;

        // get IG username
        const igUserRes = await axios.get(
          `https://graph.facebook.com/v18.0/${instagram_user_id}`,
          {
            params: {
              fields: "username,profile_picture_url",
              access_token: page_token,
            },
          }
        );

        const ig_username = igUserRes.data.username;
        const ig_profile_url = igUserRes.data.profile_picture_url || null;

        // Save or update in DB
        await FbPage.updateOne(
          { userId, page_Id },
          {
            $set: {
              userId,
              page_Id,
              page_token,
              instagram_user_id,
              ig_username,
              ig_profile_url,
            },
          },
          { upsert: true }
        );

        console.log("Saved Instagram-linked page in DB.");
      }
    }

    // --- CHANGED: Fetch all pages with instagram_user_id for the user ---
    const igPages = await FbPage.find({
      userId: userId,
      instagram_user_id: { $ne: null }
    });

    if (!igPages.length) {
      return res.status(404).json({ message: "No Instagram account connected." });
    }

    // Date range setup (same as before)
    const metrics = [
      "accounts_engaged",
      "profile_views",
      "reach",
      "views",
      "likes",
      "comments",
      "shares",
      "replies",
      "saves"
    ];

    const metric1 = [
      'follower_count'
    ];

    const until = new Date();
    const since = new Date();
    since.setDate(until.getDate() - 29); // 30 days including today

    const formatDate = (date) => date.toISOString().split('T')[0];
    const sinceFormatted = formatDate(since);
    const untilFormatted = formatDate(until);

    // --- CHANGED: Loop over all Instagram pages to fetch & save insights ---
    for (const igPage of igPages) {
      const instagramUserId = igPage.instagram_user_id;
      const pageToken = igPage.page_token;

      const responses = await Promise.all([
        axios.get(`https://graph.facebook.com/v19.0/${instagramUserId}/insights`, {
          params: {
            metric: metrics.join(","),
            period: "day",
            metric_type: "total_value",
            since: sinceFormatted,
            until: untilFormatted,
            access_token: pageToken,
          },
        }),
        axios.get(`https://graph.facebook.com/v19.0/${instagramUserId}/insights`, {
          params: {
            metric: metric1.join(","),
            period: "day",
            since: sinceFormatted,
            until: untilFormatted,
            access_token: pageToken,
          },
        }),
      ]);

      const insights = [
        ...(responses[0].data?.data || []),
        ...(responses[1].data?.data || []),
      ];

      const bulkOps = [];

      for (const insight of insights) {
        const isFollowerCount = insight.name === 'follower_count';

        const values = isFollowerCount ? insight.values : [{ end_time: new Date().toISOString() }];

        for (const val of values) {
          const endTime = new Date(val.end_time || new Date());
          const endTimeNormalized = new Date(endTime.toISOString().split("T")[0] + "T00:00:00.000Z");

          const doc = {
            userId,
            ig_user_id: instagramUserId,
            metric: insight.name,
            value: val.value ?? (insight.total_value?.value || 0),
            period: insight.period,
            end_time: endTimeNormalized,
            title: insight.title || "",
            description: insight.description || "",
          };
          bulkOps.push({
            updateOne: {
              filter: {
                userId,
                ig_user_id: doc.ig_user_id,
                metric: doc.metric,
                end_time: doc.end_time
              },
              update: { $set: doc },
              upsert: true
            }
          });
        }
      }
      if (bulkOps.length) {
        await IgAccInsight.bulkWrite(bulkOps);
      }
    }
    return res.status(200).json({ message: "Insights saved successfully" });
  } catch (error) {
    console.error("Error saving IG insights:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



// ---------IG Demographics Data

export const fetchDemographics = async (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(400).json({ message: "User ID not found" });

  // Fetch all IG-connected pages for this user
  const igPages = await FbPage.find({
    userId: userId,
    instagram_user_id: { $ne: null }
  });

  if (!igPages || igPages.length === 0) {
    return res.status(404).json({ message: "No Instagram accounts connected." });
  }

  const metrics = [
    { name: "follower_demographics", breakdowns: ["age_gender", "country", "city"] },
    { name: "reached_audience_demographics", breakdowns: ["age_gender", "country", "city"] },
    { name: "engaged_audience_demographics", breakdowns: ["age_gender", "country", "city"] }
  ];

  const allResults = [];

  for (const page of igPages) {
    const ig_user_id = page.instagram_user_id;
    const access_token = page.page_token;

    const baseUrl = `https://graph.facebook.com/v19.0/${ig_user_id}/insights`;

    for (const metric of metrics) {
      for (const breakdown of metric.breakdowns) {
        let breakdownQuery = breakdown === 'age_gender' ? 'age,gender' : breakdown;
        try {
          const response = await axios.get(baseUrl, {
            params: {
              metric: metric.name,
              metric_type: 'total_value',
              breakdown: breakdownQuery,
              period: 'lifetime',
              access_token
            }
          });

          const data = response.data.data?.[0];
          const value = {};

          if (data && data.total_value?.breakdowns?.[0]?.results?.length > 0) {
            for (const item of data.total_value.breakdowns[0].results) {
              const rawKey = item.dimension_values.join('.');
              const safeKey = rawKey.replace(/\./g, '_');
              value[safeKey] = item.value;
            }

            await IgDemographic.updateOne(
              {
                userId,
                ig_user_id,
                metric: metric.name,
                demographic_type: breakdown,
              },
              {
                $set: {
                  value,
                  period: 'lifetime',
                }
              },
              { upsert: true }
            );
            console.log(`Saved ${metric.name} - ${breakdown} for IG user ${ig_user_id}`);
            allResults.push({ ig_user_id, metric: metric.name, breakdown, saved: true });
          } else {
            console.log(`No data for ${metric.name} - ${breakdown} for IG user ${ig_user_id}`);
            allResults.push({ ig_user_id, metric: metric.name, breakdown, saved: false, message: 'No data' });
          }
        } catch (error) {
          const msg = error?.response?.data?.error?.error_user_msg || error.message;
          console.error(`Error fetching ${metric.name} (${breakdown}) for IG user ${ig_user_id}: ${msg}`);
          allResults.push({ ig_user_id, metric: metric.name, breakdown, saved: false, error: msg });
        }
      }
    }
  }
  return res.status(200).json({
    message: "Demographics fetch process completed for all IG pages.",
    results: allResults
  });
};




// ------------------Get Demographics data of IG 
export const getDemographics = async (req, res) => {
  const userId = req.user.id;
  const { pageId } = req.query;

  if (!userId) return res.status(400).json({ message: "User ID not found" });
  if (!pageId) return res.status(400).json({ message: "pageId (IG User ID) is required" });

  try {
    const data = await IgDemographic.find({ userId, ig_user_id: pageId });

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Demographics data not found for this IG page" });
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error("Error fetching IG demographics:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};




//get data of ig page-level
export const getIgAcc = async (req, res) => {
  const data = await IgAccInsight.find();
  res.json(data);
}
// delete data
export const deleteInstaAccInsight = async (req, res) => {
  const data = await IgAccInsight.deleteMany({});
  res.json({ success: true });
}




// Get Instagram Profile data like page Id, Pic,Name etc.
export const InstaProfile = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID not found" });
  }
  try {
    const instaProfiles = await FbPage.find({ userId, instagram_user_id: { $ne: null } });

    if (!instaProfiles || instaProfiles.length === 0) {
      return res.status(404).json({ message: "No Instagram profiles found for this user" });
    }
    const formattedProfiles = instaProfiles.map(profile => ({
      instagram_user_id: profile.instagram_user_id,
      ig_username: profile.ig_username,
      ig_profile_url: profile.ig_profile_url,
    }));

    res.status(200).json({ data: formattedProfiles });
  } catch (err) {
    console.error("Error fetching Instagram profiles:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};





//-----------------------------------filter

export const getFilteredIgAcc = async (req, res) => {
  const userId = req.user.id;

  try {
    const { type, value, start, end, pageId } = req.query;
    const filter = { userId };

    if (pageId) {
      filter.ig_user_id = pageId;
    }
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
        // Default to last 7 days
        const today = new Date();
        const pastWeek = new Date();
        pastWeek.setDate(today.getDate() - 6);
        filter.end_time = {
          $gte: new Date(pastWeek.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
      }
    }

    const insights = await IgAccInsight.find(filter).sort({ end_time: 1 });

    if (!insights || insights.length === 0) {
      return res.status(404).json({ message: 'No data found for the selected filter.' });
    }

    res.status(200).json(insights);
  } catch (error) {
    console.error("Filter error:", error.message);
    res.status(500).json({ error: error.message });
  }
};







// ---------------------GROWTH Calculation
export const getAccIgGrowthAnalytics = async (req, res) => {
  const userId = req.user.id;
  console.log("userId of growth Instagram", userId);

  try {
    const { type, value, start, end, pageId } = req.query;

    if (!pageId) {
      return res.status(400).json({ error: "Missing pageId in query" });
    }

    const { startCurrent, endCurrent, startPrevious, endPrevious } =
      getPeriodDates(type, value, start, end);

    const metrics = [
      "accounts_engaged",
      "profile_views",
      "reach",
      "views",
      "likes",
      "comments",
      "shares",
      "replies",
      "saves",
      "follower_count"
    ];

    // Use ig_user_id instead of pageId
    const baseFilter = { userId, ig_user_id: pageId };

    const currentFilter = {
      ...baseFilter,
      end_time: { $gte: startCurrent, $lte: endCurrent },
      metric: { $in: metrics }
    };

    const previousFilter = {
      ...baseFilter,
      end_time: { $gte: startPrevious, $lte: endPrevious },
      metric: { $in: metrics }
    };

    const currentData = await IgAccInsight.find(currentFilter);
    const previousData = await IgAccInsight.find(previousFilter);

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
        growth: `${growth}`
      };
    });

    res.status(200).json({ data: result });
  } catch (err) {
    console.error("Growth Analytics Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

