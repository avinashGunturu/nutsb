import express from 'express';
import { submitInquiry, getInquiries } from '../controllers/wholesaleController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/inquiry', submitInquiry);
router.get('/', protect, admin, getInquiries); // GET /api/wholesale (Prot)

export default router;
