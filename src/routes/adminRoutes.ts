import express from 'express';
import { getDashboardStats, updateUserRole } from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/dashboard/stats', protect, admin, getDashboardStats);
router.put('/users/:id/role', protect, admin, updateUserRole);

export default router;
