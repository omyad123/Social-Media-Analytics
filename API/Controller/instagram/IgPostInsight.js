import axios from "axios";
import IgPostInsight from "../../Model/Instagram/IgPostInsight.js";
import FbPage from "../../Model/FbPage.js";

export const IgPostData = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return console.log("User ID not found");
  }

  const metricsByType = {
    IMAGE: ['reach', 'saved', 'likes', 'comments'],
    VIDEO: ['reach', 'saved', 'likes', 'comments'],
    REEL: ['reach', 'plays', 'likes', 'comments', 'shares', 'saved'],
    CAROUSEL_ALBUM: ['impressions', 'reach', 'saved', 'likes', 'comments']
  };

  try {
    // Fetch ALL pages for this user
    const userPages = await FbPage.find({ userId });

    if (!userPages.length) {
      return res.status(404).json({ error: "No Instagram pages found for this user" });
    }

    // Loop over each IG page
    for (const userPage of userPages) {
      const ig_user_id = userPage.instagram_user_id;
      const ACCESS_TOKEN = userPage.page_token;

      const { data: { data: posts = [] } } = await axios.get(
        `https://graph.facebook.com/v19.0/${ig_user_id}/media`,
        {
          params: {
            fields: 'id,caption,timestamp,media_type,media_url,permalink',
            access_token: ACCESS_TOKEN,
          },
        }
      );
      if (posts.length === 0) {
        console.log(`No posts found for IG user ${ig_user_id}`);
        continue;
      }
      for (const post of posts) {
        const allowedMetrics = metricsByType[post.media_type] || ['reach', 'likes', 'comments'];

        try {
          const { data: { data: insights = [] } } = await axios.get(
            `https://graph.facebook.com/v19.0/${post.id}/insights`,
            {
              params: {
                metric: allowedMetrics.join(','),
                access_token: ACCESS_TOKEN,
              },
            }
          );
          const metrics = {};
          insights.forEach(metric => {
            metrics[metric.name] = metric.values?.[0]?.value || 0;
          });
          await IgPostInsight.updateOne(
            {
              userId,
              ig_user_id,
              media_id: post.id,
            },
            {
              $set: {
                media_type: post.media_type,
                caption: post.caption || "",
                permalink: post.permalink,
                post_timestamp: new Date(post.timestamp),
                metrics,
              },
            },
            { upsert: true }
          );

        } catch (insightError) {
          console.warn(`Failed to fetch insights for media ID ${post.id} (${post.media_type})`);
          console.warn(insightError?.response?.data || insightError.message);
        }
      }
    }
    res.status(200).json({ message: "Post insights for all IG pages stored/updated successfully." });
  } catch (error) {
    console.error("Error fetching posts:", error?.response?.data || error.message);
    res.status(500).json({
      message: "Something went wrong while fetching posts.",
      error: error?.response?.data || error.message,
    });
  }
};




// get post data
export const getIgPostData = async (req, res) => {
  const data = await IgPostInsight.find({});
  res.json(data);
}



//---------------------------------------------------------------Filter by reach for post Distribution

export const getPostFilteredbyreach = async (req, res) => {
  const userId = req.user.id;
  try {
    const { type, value, start, end, metric = 'reach', pageId } = req.query;
    let filter = { userId };
    if (pageId) {
      filter.ig_user_id = pageId; 
    }

    if ((type === 'year' || type === 'month' || type === 'day') && !value) {
      return res.status(400).json({ error: `Missing "value" for ${type} type` });
    }

    let startDate, endDate;
    if (type === 'year') {
      startDate = new Date(`${value}-01-01T00:00:00Z`);
      endDate = new Date(`${value}-12-31T23:59:59Z`);
      filter.post_timestamp = { $gte: startDate, $lte: endDate };
    } else if (type === 'month') {
      const [year, month] = value.split('-');
      startDate = new Date(`${year}-${month}-01T00:00:00Z`);
      endDate = new Date(`${year}-${month}-31T23:59:59Z`);
      filter.post_timestamp = { $gte: startDate, $lte: endDate };
    } else if (type === 'day') {
      startDate = new Date(`${value}T00:00:00Z`);
      endDate = new Date(`${value}T23:59:59Z`);
      filter.post_timestamp = { $gte: startDate, $lte: endDate };
    } else if (type === 'range' && start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
      filter.post_timestamp = { $gte: startDate, $lte: endDate };
    } else if (type === 'last7days') {
      const now = new Date();
      startDate = new Date(now.setDate(now.getDate() - 7));
      filter.post_timestamp = { $gte: startDate };
    } else if (type === 'last30days') {
      const now = new Date();
      startDate = new Date(now.setDate(now.getDate() - 30));
      filter.post_timestamp = { $gte: startDate };
    } else if (type === 'currentMonth') {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      filter.post_timestamp = { $gte: startDate, $lte: endDate };
    } else if (type === 'lastYear') {
      const now = new Date();
      const lastYear = now.getFullYear() - 1;
      startDate = new Date(`${lastYear}-01-01T00:00:00Z`);
      endDate = new Date(`${lastYear}-12-31T23:59:59Z`);
      filter.post_timestamp = { $gte: startDate, $lte: endDate };
    }


    filter["metrics." + metric] = { $exists: true, $gt: 0 };

    const posts = await IgPostInsight.find(filter).sort({ [`metrics.${metric}`]: -1 });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No data found for the selected filter.' });
    }

    const reachByType = {};
    posts.forEach(post => {
      const reach = post.metrics.get(metric);
      if (reach > 0) {
        if (!reachByType[post.media_type]) {
          reachByType[post.media_type] = 0;
        }
        reachByType[post.media_type] += reach;
      }
    });

    const totalReach = Object.values(reachByType).reduce((acc, curr) => acc + curr, 0);
    if (totalReach === 0) {
      return res.status(404).json({ message: 'No valid reach data available for the selected filter.' });
    }
    const distribution = Object.entries(reachByType).map(([mediaType, reach]) => ({
      mediaType,
      reach,
      percentage: ((reach / totalReach) * 100).toFixed(2)
    }));
    res.status(200).json(distribution);

  } catch (error) {
    res.status(500).json({ error: error.message});
  }
};









//----------------------------------------------Top 5 Post

export const getTop5Post = async (req, res) => {
  const userId = req.user.id;
  try {
    const { type, value, start, end, pageId } = req.query;
    let filter = { userId };

    if (pageId) {
      filter.ig_user_id = pageId;
    }
    if (type === 'day' && value) {
      const day = new Date(value);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      filter.post_timestamp = { $gte: day, $lt: nextDay };
    } else if (type === 'month' && value) {
      const [year, month] = value.split('-');
      const startMonth = new Date(year, month - 1, 1);
      const endMonth = new Date(year, month, 0, 23, 59, 59);
      filter.post_timestamp = { $gte: startMonth, $lte: endMonth };
    } else if (type === 'year' && value) {
      const yearStart = new Date(`${value}-01-01T00:00:00`);
      const yearEnd = new Date(`${value}-12-31T23:59:59`);
      filter.post_timestamp = { $gte: yearStart, $lte: yearEnd };
    } else if (type === 'range' && start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      filter.post_timestamp = { $gte: startDate, $lte: endDate };
    } else if (type === 'last30days') {
      const today = new Date();
      const past30 = new Date();
      past30.setDate(today.getDate() - 29);
      filter.post_timestamp = {
        $gte: new Date(past30.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      };
    } else if (type === 'last7days') {
      const today = new Date();
      const past7 = new Date();
      past7.setDate(today.getDate() - 6);
      filter.post_timestamp = {
        $gte: new Date(past7.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      };
    } else if (type === 'currentMonth') {
      const today = new Date();
      const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
      filter.post_timestamp = { $gte: startMonth, $lte: endMonth };
    } else {
      return res.status(400).json({ error: "Invalid or missing parameters" });
    }
    const posts = await IgPostInsight.find(filter)
      .sort({ "metrics.reach": -1 }) // Sort by 'reach' metric in descending order
      .limit(5)
      .lean();

    const mediaMetrics = {
      IMAGE: ['reach', 'saved', 'likes', 'comments'],
      VIDEO: ['reach', 'saved', 'likes', 'comments'],
      REEL: ['reach', 'plays', 'likes', 'comments', 'shares', 'saved'],
      CAROUSEL_ALBUM: ['reach', 'saved', 'likes', 'comments']
    };

    const resultPosts = posts.map((post) => {
      const validMetrics = mediaMetrics[post.media_type] || [];

      let postMetrics = {};
      validMetrics.forEach((metricName) => {
        postMetrics[metricName] = post.metrics?.[metricName] || 0;
      });

      return {
        post_id: post.media_id,
        post_timestamp: post.post_timestamp,
        type: post.media_type,
        permalink: post.permalink,
        metrics: postMetrics
      };
    });

    res.status(200).json({
      posts: resultPosts,
      isFallback: false,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


////// DELETE Post data

export const deletePost = async (req, res) => {
  await IgPostInsight.deleteMany({});
  res.json({ success: true });
}