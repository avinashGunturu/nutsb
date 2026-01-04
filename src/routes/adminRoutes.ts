import express from 'express';
import { getDashboardStats, updateUserRole, getAllCustomers, getCustomerById, getCustomersByIds } from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/dashboard/stats', protect, admin, getDashboardStats);
router.post('/customers', protect, admin, getAllCustomers);
router.post('/customers/by-ids', protect, admin, getCustomersByIds);
router.get('/customers/:id', protect, admin, getCustomerById);
router.put('/users/:id/role', protect, admin, updateUserRole);

export default router;
