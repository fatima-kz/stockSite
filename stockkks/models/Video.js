import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  keywords: [String],
  category: String,
  cloudinary_url: String,
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Video', videoSchema);
