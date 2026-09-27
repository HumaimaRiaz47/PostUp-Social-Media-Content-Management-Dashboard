const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  serial: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  verticalImage: { type: String },
  horizontalImage: { type: String },
  platform: {
    facebook: { type: Boolean, default: false },
    instagram: { type: Boolean, default: false },
    threads: { type: Boolean, default: false },
    linkedin: { type: Boolean, default: false },
  },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
