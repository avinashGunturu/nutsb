import express from 'express';
import { submitInquiry, getInquiries, getInquiryById, updateInquiryStatus } from '../controllers/wholesaleController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/inquiry', submitInquiry);
router.post('/filter', protect, admin, getInquiries); // POST /api/wholesale/filter (Prot)
router.get('/:id', protect, admin, getInquiryById); // GET /api/wholesale/:id (Prot)
router.put('/:id/status', protect, admin, updateInquiryStatus); // PUT /api/wholesale/:id/status (Prot)

export default router;
