import mongoose from "mongoose";

const contentInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  page_id: { type: String, required: true },
  post_id: { type: String, required: true },
  created_time: { type: Date, required: true },

  permalink_url: { type: String },
  media_url: { type: String },
  media_type: { type: String },

  metrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
  },

  period: { type: String },
  end_time: { type: Date }, 
}, { timestamps: true });

contentInsightSchema.index({ post_id: 1 }, { unique: true });

const ContentInsight = mongoose.model("ContentInsight", contentInsightSchema);
export default ContentInsight;
