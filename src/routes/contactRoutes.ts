import express from 'express';
import { submitContact, getContactRequests } from '../controllers/contactController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', submitContact);
router.post('/filter', protect, admin, getContactRequests);

export default router;
