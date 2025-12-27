import express from 'express';
import { upload, uploadImage } from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, upload.single('image'), uploadImage);

export default router;
