import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import { sendSuccess, sendError } from '../utils/apiResponse';

// @desc    Apply Coupon
// @route   POST /api/coupons/apply
// @access  Public (Authenticated User preferred for granular checks)
export const applyCoupon = async (req: Request | any, res: Response) => {
    try {
        const { code, cartTotal } = req.body;
        const userId = req.user ? req.user.id : null;

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return sendError(res, 'Invalid coupon code', 400);
        }

        // Date Validation
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            return sendError(res, 'Coupon is expired or not yet valid', 400);
        }

        // Usage Limit Validation
        if (coupon.usedCount >= coupon.usageLimit) {
            return sendError(res, 'Coupon usage limit exceeded', 400);
        }

        // Min Order Value
        if (cartTotal < coupon.minOrderValue) {
            return sendError(res, `Minimum order value of ₹${coupon.minOrderValue} required`, 400);
        }

        // User Restriction
        if (coupon.applicableTo === 'specific_users') {
            if (!userId) {
                return sendError(res, 'Login required to use this coupon', 401);
            }
            if (!coupon.assignedUsers.map(id => id.toString()).includes(userId)) {
                return sendError(res, 'This coupon is not applicable for your account', 403);
            }
        }

        // Calculate Discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        sendSuccess(res, {
            couponCode: coupon.code,
            discountAmount,
            finalTotal: cartTotal - discountAmount,
            _id: coupon._id
        }, 'Coupon applied successfully');

    } catch (error: any) {
        sendError(res, 'Failed to apply coupon', 500, error.message);
    }
};

// @desc    Create Coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
export const createCoupon = async (req: Request, res: Response) => {
    try {
        const coupon = await Coupon.create(req.body);
        sendSuccess(res, coupon, 'Coupon created successfully', 201);
    } catch (error: any) {
        sendError(res, 'Failed to create coupon', 500, error.message);
    }
};

// @desc    Get All Coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
export const getCoupons = async (req: Request, res: Response) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        sendSuccess(res, coupons, 'Coupons fetched successfully');
    } catch (error: any) {
        sendError(res, 'Failed to fetch coupons', 500, error.message);
    }
};
