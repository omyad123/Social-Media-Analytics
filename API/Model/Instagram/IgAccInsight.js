import mongoose from "mongoose";

const mySchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required :true
    },
    ig_user_id: { type: String, required: true },
    metric: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    period: { type: String, required: true },
    end_time: { type: Date, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  }, { timestamps: true });

  mySchema.index(
    { userId: 1, ig_user_id: 1, metric: 1, end_time: 1 },
    { unique: true }
  );

  const IgAccInsight = mongoose.model("IgAccInsight", mySchema);
  export default IgAccInsight;



