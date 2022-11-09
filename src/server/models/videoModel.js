import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  description: { type: String, required: true, trim: true, minLength: 10 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

videoSchema.pre("save", async function () {
  console.log(this);
  this.hashtags = this.hashtags[0]
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const video = mongoose.model("Video", videoSchema);
export default video;
