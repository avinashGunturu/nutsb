import express from 'express';
import { applyCoupon, createCoupon, getCoupons, updateCouponStatus } from '../controllers/couponController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management
 */

// Public
router.post('/apply', protect, applyCoupon);

// Admin
router.post('/', protect, admin, createCoupon);
router.post('/list', protect, admin, getCoupons);
router.put('/:id/status', protect, admin, updateCouponStatus);

export default router;
