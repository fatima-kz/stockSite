import express from 'express';
import { uploadVideo, searchVideos } from '../controllers/videoController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/upload', verifyToken, uploadVideo);
router.get('/search', searchVideos);

export default router;
