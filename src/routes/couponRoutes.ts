import express from 'express';
import { applyCoupon, createCoupon, getCoupons } from '../controllers/couponController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management
 */

// Public
router.post('/apply', protect, applyCoupon); // Optional auth protection handled in controller, but safer to use middleware if needed. Controller handles unauthed check gracefully though. Let's keep middleware optional or use a loose middleware.
// Actually, for specific_users check, we need req.user. Adding 'protect' might block guests from general coupons if we enforce it strictly.
// Better approach: use a middleware that populates user if token exists but doesn't error if not. 
// For now, let's assume checkout requires login or we implement 'optionalProtect'. 
// I'll stick to 'protect' being optional or we just rely on client sending token and controller logic.
// Simplicity: Let's assume user must be logged in to checkout/apply coupon for now, or just remove 'protect' and rely on manual token extraction if we want guest checkout support.
// Given B2C usually allows guest checkout, I'll remove 'protect' here and handle JWT manual decode or creates 'optionalProtect'.

// Admin
router.post('/', protect, admin, createCoupon);
router.get('/', protect, admin, getCoupons);

export default router;
