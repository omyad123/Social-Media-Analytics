import axios from "axios";
import Performence from '../Model/Performence.js';
import FbPage from "../Model/FbPage.js";

export const getContentPerformance = async (req, res) => {
  const userId = req.user.id;

  try {
    const userPages = await FbPage.find({ userId });

    if (!userPages || userPages.length === 0) {
      return res.status(404).json({ error: "No pages found for this user" });
    }

    let totalPostsFetched = 0;

    for (const page of userPages) {
      const { page_Id: pageId, page_token: accessToken } = page;

      const posts = await fetchAllPosts(pageId, accessToken);
      totalPostsFetched += posts.length;

      for (const post of posts) {
        const post_id = post.id;
        const created_time = new Date(post.created_time);
        const permalink_url = post.permalink_url || "";
        const attachment = post.attachments?.data?.[0] || {};
        const media_type = attachment.media_type || "unknown";
        const media_url = attachment.media?.image?.src || attachment.media?.source || attachment.url || "";

        const insightsUrl = `https://graph.facebook.com/v19.0/${post_id}/insights`;
        const { data: insightsResponse } = await axios.get(insightsUrl, {
          params: {
            metric: "post_impressions,post_reactions_by_type_total,post_clicks,post_video_views,post_video_avg_time_watched,post_impressions_unique",
            access_token: accessToken,
          },
        });
        const metrics = {};
        for (const metric of insightsResponse.data) {
          metrics[metric.name] = metric.values?.[0]?.value || 0;
        }

        const doc = {
          userId,
          page_id: pageId,
          post_id,
          created_time,
          permalink_url,
          media_url,
          media_type,
          metrics,
          period: 'lifetime',
          end_time: insightsResponse?.data?.[0]?.values?.[0]?.end_time ? new Date(insightsResponse.data[0].values[0].end_time) : null,
        };

        await Performence.updateOne(
          { post_id },
          { $set: doc },
          { upsert: true }
        );
      }
    }

    res.status(200).json({
      message: "All content performance fetched and stored successfully",
      totalPostsFetched
    });

  } catch (err) {
    console.error("Performance error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch post performance data", error: err.message });
  }
};

// Helper function for fetching content insight
const fetchAllPosts = async (pageId, accessToken) => {
  const allPosts = [];
  let nextUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time,permalink_url,attachments{media_type,media,url}&limit=25&access_token=${accessToken}`;

  while (nextUrl) {
    const { data } = await axios.get(nextUrl);
    allPosts.push(...data.data);
    nextUrl = data.paging?.next || null;
  }

  return allPosts;
};



export const getContentData = async (req, res) => {
  let ress = await Performence.find();
  res.json(ress);
}


//filter logic

export const getFilteredContentInsights = async (req, res) => {
  const userId = req.user.id;

  try {
    const { type, value, start, end } = req.query;
    let timeFilter = {};

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
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
        break;
      }
      case 'last30days': {
        const today = new Date();
        const past30 = new Date();
        past30.setDate(today.getDate() - 29);
        timeFilter = {
          $gte: new Date(past30.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
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
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
      }
    }

    const filter = {
      userId,
      $or: [
        { end_time: { $ne: null, ...timeFilter } },
        { end_time: null, created_time: timeFilter }
      ]
    };
    const contentInsights = await Performence.find(filter).sort({ end_time: 1 });
    if (!contentInsights || contentInsights.length === 0) {
      return res.status(404).json({ message: 'No content data found for selected filter.' });
    }

    res.status(200).json(contentInsights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




////////// Top 5 post by facebook
export const getTop5FacebookPosts = async (req, res) => {
  const userId = req.user.id;
  try {
    const { type, value, start, end, pageId } = req.query;
    let filter = { userId };

    // Optional: filter by specific pageId
    if (pageId && pageId.trim() !== '') {
      filter.page_id = pageId.toString();
    }

    if (!type) {
      return res.status(400).json({ error: "Type parameter is required" });
    }
    const now = new Date();
    switch (type) {
      case 'day': {
        if (!value) return res.status(400).json({ error: "'value' is required for type 'day'" });
        const day = new Date(value);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        filter.created_time = { $gte: day, $lt: nextDay };
        break;
      }
      case 'month': {
        if (!value || !value.includes('-')) {
          return res.status(400).json({ error: "'value' must be in YYYY-MM format" });
        }
        const [year, month] = value.split('-');
        const startMonth = new Date(year, month - 1, 1);
        const endMonth = new Date(year, month, 0, 23, 59, 59);
        filter.created_time = { $gte: startMonth, $lte: endMonth };
        break;
      }

      case 'year': {
        if (!value) return res.status(400).json({ error: "'value' is required for type 'year'" });
        const yearStart = new Date(`${value}-01-01T00:00:00`);
        const yearEnd = new Date(`${value}-12-31T23:59:59`);
        filter.created_time = { $gte: yearStart, $lte: yearEnd };
        break;
      }

      case 'range': {
        if (!start || !end) return res.status(400).json({ error: "'start' and 'end' are required for type 'range'" });
        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        filter.created_time = { $gte: startDate, $lte: endDate };
        break;
      }

      case 'last7days': {
        const today = new Date();
        const past7 = new Date();
        past7.setDate(today.getDate() - 6);
        filter.created_time = {
          $gte: new Date(past7.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
        break;
      }

      case 'last30days': {
        const today = new Date();
        const past30 = new Date();
        past30.setDate(today.getDate() - 29);
        filter.created_time = {
          $gte: new Date(past30.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
        break;
      }

      case 'currentMonth': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        filter.created_time = { $gte: startOfMonth, $lte: endOfMonth };
        break;
      }

      default:
        return res.status(400).json({ error: "Invalid type parameter" });
    }

    // Fetch top 5 posts sorted by impressions
    const posts = await Performence.find(filter)
      .sort({ "metrics.post_impressions": -1, "created_time": -1 })
      .lean();

    const topPosts = posts.slice(0, 5);

    const resultPosts = topPosts.map((post) => ({
      postId: post.media_id,
      postTimestamp: post.created_time,
      mediaType: post.media_type,
      permalink: post.permalink,
      metrics: {
        impressions: post.metrics?.post_impressions || 0,
        totalClicks: post.metrics?.post_clicks || 0,
        reactionsCount: post.metrics?.post_reactions_by_type_total || {},
        videoViews: post.metrics?.post_video_views || 0,
        averageWatchTime: post.metrics?.post_video_avg_time_watched || 0,
        uniqueImpressions: post.metrics?.post_impressions_unique || 0,
      },
      mediaUrl: post.media_url || "",
      permalinkUrl: post.permalink_url || ""
    }));

    res.status(200).json({
      posts: resultPosts,
      isFallback: false,
    });

  } catch (error) {
    console.error("Error fetching top Facebook posts:", error);
    res.status(500).json({ error: error.message });
  }
};



















// Delete Route

export const performenceDelete = async (req, res) => {
  const data = await Performence.deleteMany({});
  res.json({ success: true });
}