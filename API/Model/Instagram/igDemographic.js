
import mongoose from "mongoose";


const mySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    ig_user_id: { type: String, required: true },
    demographic_type: { type: String, required: true }, // e.g., "age_gender", "country", "city"
    metric: { type: String, required: true }, // e.g., "follower_demographics"
    value: { type: Map, of: Number, required: true },  // dynamic keys like "M.25-34", "US"
    period: { type: String, default: "lifetime" },
  }, { timestamps: true });
  
  mySchema.index(
    { userId: 1, ig_user_id: 1, metric: 1, demographic_type: 1,},
    { unique: true }
  );
  
  const IgDemographic = mongoose.model("IgDemographic", mySchema);

  export default IgDemographic;

  
  