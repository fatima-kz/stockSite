import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import videoRoutes from '../routes/videoRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import contactRoutes from '../routes/contactRoutes.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
const rootDir = path.resolve(__dirname, '..');
app.use(express.static(rootDir));


app.use(express.static(path.join(process.cwd(), 'public')));

// API Routes
app.use('/api/videos', videoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// Serve the frontend for any other route
app.get('*', (req, res) => {
  // Don't serve admin.html for all routes
  if (req.path === '/admin') {
    res.sendFile(path.join(rootDir, 'admin.html'));
  } else {
    res.sendFile(path.join(rootDir, 'index.html'));
  }
});



// DB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
}).catch(err => console.log(err));
