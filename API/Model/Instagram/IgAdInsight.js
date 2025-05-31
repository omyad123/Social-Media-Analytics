import mongoose from "mongoose";

const adsInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ig_user_id: { type: String, required: true },
  ad_account_id: { type: String, required: true },
  campaign_id: { type: String },
  campaign_name: { type: String },
  adset_id: { type: String },
  adset_name: { type: String }, 
  ad_id: { type: String },

metrics: {
  type: Map,
  of: mongoose.Schema.Types.Mixed,
  required: true,
},
 
  date_start: { type: Date, required: true },
  date_stop: { type: Date, required: true },

}, { timestamps: true });

adsInsightSchema.index(
  { ad_account_id: 1, ad_id: 1, date_start: 1, date_stop: 1 },
  { unique: true }
);

const IgAdInsight = mongoose.model("IgAdInsight", adsInsightSchema);
export default IgAdInsight;
