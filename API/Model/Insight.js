
import mongoose from "mongoose";

const mySchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true, 
    },
    page_id: { type: String, required: true },
    metric: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }, 
    period: { type: String, required: true }, 
    end_time: { type: Date, required: true }, 
    description: { type: String, default: "" },
}, { timestamps: true });

mySchema.index({ userId: 1, page_id: 1, metric: 1, end_time: 1 }, { unique: true });

const Insight = mongoose.model("Insight", mySchema);

export default Insight;
