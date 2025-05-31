import mongoose from "mongoose";

const IgPostInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ig_user_id: { 
    type: String, 
    required: true 
  },
  media_id: { 
    type: String, 
    required: true 
  },
  media_type: { 
    type: String 
  },
  caption: { 
    type: String 
  },
  permalink: { 
    type: String 
  },
  post_timestamp: { 
    type: Date, 
    required: true 
  },
  metrics: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

IgPostInsightSchema.index({ ig_user_id: 1, media_id: 1 }, { unique: true });

const IgPostInsight = mongoose.model("IgPostInsight", IgPostInsightSchema);

export default IgPostInsight;
