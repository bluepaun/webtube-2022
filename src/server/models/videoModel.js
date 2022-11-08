import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  createAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String }],
  meta: {
    views: Number,
    rating: Number,
  },
});

const video = mongoose.model("Video", videoSchema);
export default video;
