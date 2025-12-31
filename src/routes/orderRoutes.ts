import express from 'express';
import {
    initiateCheckout,
    verifyPayment,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
} from '../controllers/orderController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Customer
router.post('/checkout/initiate', protect, initiateCheckout);
router.post('/checkout/verify', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);

// Admin
router.post('/list', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
