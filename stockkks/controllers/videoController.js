import Video from '../models/Video.js';
import cloudinary from '../utils/cloudinary.js';
import multer from 'multer';
import { Readable } from 'stream';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for memory storage instead of disk storage
const storage = multer.memoryStorage();
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
      
      // Create a buffer stream from the file buffer
      const stream = new Readable();
      stream.push(req.file.buffer);
      stream.push(null);
      
      // Upload directly to Cloudinary from memory
      let result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'video' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        stream.pipe(uploadStream);
      });

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
