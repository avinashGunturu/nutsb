import express from 'express';
import { upload, uploadImage, getFileDetails, deleteFile } from '../controllers/uploadController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), uploadImage);
router.get('/:id', getFileDetails);
router.delete('/:id', protect, admin, deleteFile);

export default router;
