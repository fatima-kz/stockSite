import Video from '../models/Video.js';
import cloudinary from '../utils/cloudinary.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up temp storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Create middleware for video upload
const uploadMiddleware = upload.single('video');

export const uploadVideo = (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
      });

      // Remove local temp file
      fs.unlinkSync(req.file.path);

      const { title, description, keywords, category } = req.body;
      
      if (!title || !description || !keywords || !category) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      
      const newVideo = new Video({
        title,
        description,
        keywords: keywords.split(',').map(k => k.trim()),
        category,
        cloudinary_url: result.secure_url,
      });

      await newVideo.save();
      res.json({ message: 'Uploaded successfully', video: newVideo });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err.message });
    }
  });
};

export const searchVideos = async (req, res) => {
  try {
    const { keyword, category } = req.query;
    const query = {};

    if (keyword) {
      query.keywords = { $regex: keyword, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const videos = await Video.find(query).sort({ uploadedAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
