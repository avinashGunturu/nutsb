import express from 'express';
import { submitContact, getContactRequests, updateContactStatus } from '../controllers/contactController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', submitContact);
router.post('/filter', protect, admin, getContactRequests);
router.put('/:id/status', protect, admin, updateContactStatus);

export default router;
