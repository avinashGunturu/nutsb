import express from 'express';
import { createTemplate, getTemplates, sendNotification } from '../controllers/notificationController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/templates', protect, admin, createTemplate);
router.get('/templates', protect, admin, getTemplates);
router.post('/send', protect, admin, sendNotification);

export default router;
