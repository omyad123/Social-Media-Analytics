import mongoose from "mongoose";

const mySchema = new mongoose.Schema({
     userId:{
              type: mongoose.Schema.Types.ObjectId,
              ref:"User",
              required:true, 
          },
  story_id: { type: String, required: true }, 
  ig_user_id: { type: String, required: true },
  metric: { type: String, required: true },
  media_type: { type: String},
  end_time: { type: Date, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String, default: "" },
}, { timestamps: true });

mySchema.index({ ig_user_id: 1, metric: 1, end_time: 1, story_id:1},{ unique: true });

const IgStoryInsight = mongoose.model("IgStoryInsight", mySchema);
export default IgStoryInsight;
