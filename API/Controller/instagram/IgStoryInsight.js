import axios from "axios";
import IgStoryInsight from "../../Model/Instagram/IgStoryInsight.js";




export const getStory = async (req, res) => {
  const userId = req.user.id;
  
  if (!userId) {
    return res.status(400).json({ message: "User ID not found" });
  }

  try {

     const userPage = await FbPage.findOne({ userId: userId });
    
        if (!userPage) {
          return res.status(404).json({ error: "No page found for this user" });
        }
    
        const ig_user_id = userPage.instagram_user_id;
        const ACCESS_TOKEN = userPage.page_token;
   

    const { data: storyRes } = await axios.get(
      `https://graph.facebook.com/v19.0/${ig_user_id}/stories?access_token=${ACCESS_TOKEN}`
    );

    const stories = storyRes.data;

    if (!stories.length) {
      return res.status(404).json({ message: "No stories found" });
    }

    const savedInsights = [];

    for (let story of stories) {
      const storyId = story.id;

      try {
        const { data: insightRes } = await axios.get(
          `https://graph.facebook.com/v19.0/${storyId}/insights`,
          {
            params: {
              metric:
                "impressions,reach,replies,exits,taps_forward,taps_back",
              access_token: ACCESS_TOKEN,
            },
          }
        );

        for (let item of insightRes.data) {
          const newDoc = new IgStoryInsight({
            userId: new mongoose.Types.ObjectId(userId),
            story_id: storyId,
            ig_user_id,
            metric: item.name,
            value: item.values[0].value,
            end_time: new Date(item.values[0].end_time),
            description: item.title || "",
            media_type: story.media_type || "STORY",
          });

          await IgStoryInsight.updateOne(
            {
              userId: newDoc.userId,
              story_id: newDoc.story_id,
              metric: newDoc.metric,
              end_time: newDoc.end_time,
            },
            { $set: newDoc },
            { upsert: true }
          );

          savedInsights.push(newDoc);
        }
      } catch (err) {
        const msg = err?.response?.data?.error?.message;
        if (
          msg &&
          msg.includes("Not enough viewers for the media to show insights")
        ) {
          console.log(`Skipped story ${storyId}: Not enough viewers`);
        } else {
          console.error(`Error fetching insights for story ${storyId}:`, msg);
        }
      }
    }

    res.status(200).json({
      message: "Insights fetched and saved successfully",
      data: savedInsights,
    });
  } catch (err) {
    console.error("Failed to fetch stories:", err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};




// filter
export const getFilteredIgStory = async (req, res) => {
  const userId = req.user.id;
  try {
    const { type, value, start, end } = req.query;
    let filter = {}; 

     // Validation for required fields (as per your logic)
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
        filter.end_time = {
          $gte: startDate,
          $lte: endDate
        };
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
        // Default: last 7 days
        const today = new Date();
        const pastWeek = new Date();
        pastWeek.setDate(today.getDate() - 6);
        filter.end_time = {
          $gte: new Date(pastWeek.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
      }
    }
    
    const insights = await IgStoryInsight.find(filter).sort({ end_time: 1 });

    if (!insights || insights.length === 0) {
      return res.status(404).json({ message: 'No data found for the selected filter.' });
    }

    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};