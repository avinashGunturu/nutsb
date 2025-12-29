import express from 'express';
import { submitInquiry, getInquiries } from '../controllers/wholesaleController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/inquiry', submitInquiry);
router.post('/filter', protect, admin, getInquiries); // POST /api/wholesale/filter (Prot)

export default router;
