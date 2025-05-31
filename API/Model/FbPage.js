import mongoose from "mongoose";


const pageSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    page_token: { type: String, required: true },
    page_name: { type: String},
    page_Id: { type: String, required: true },
    Fb_profile_url:{type: String, default: null},
    
    // Instagram fields
    instagram_user_id: { type: String, default: null},
    ig_username: { type: String, default: null },
    ig_profile_url: { type: String,default:null},

  }, { timestamps: true });
  

  pageSchema.index({ userId: 1, page_Id: 1 }, { unique: true });
  
  const FbPage = mongoose.model("FbPage", pageSchema);
  export default FbPage;