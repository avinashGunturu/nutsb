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
        const { code } = req.body;

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return sendError(res, 'Coupon code already exists', 400);
        }

        const coupon = await Coupon.create(req.body);
        sendSuccess(res, coupon, 'Coupon created successfully', 201);
    } catch (error: any) {
        // Handle Mongoose duplicate key error just in case race condition
        if (error.code === 11000) {
            return sendError(res, 'Coupon code already exists', 400);
        }
        sendError(res, 'Failed to create coupon', 500, error.message);
    }
};

// @desc    Update Coupon Status
// @route   PUT /api/admin/coupons/:id/status
// @access  Private/Admin
export const updateCouponStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return sendError(res, 'Invalid status value. Must be boolean.', 400);
        }

        const coupon = await Coupon.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!coupon) {
            return sendError(res, 'Coupon not found', 404);
        }

        sendSuccess(res, coupon, `Coupon is now ${isActive ? 'Active' : 'Inactive'}`);
    } catch (error: any) {
        sendError(res, 'Failed to update coupon status', 500, error.message);
    }
};

// @desc    Get All Coupons (with Filters)
// @route   POST /api/coupons/list
// @access  Private/Admin
export const getCoupons = async (req: Request, res: Response) => {
    try {
        const {
            search,
            isActive,
            discountType,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.body;

        const query: any = {};

        // Search by Code
        if (search) {
            query.code = { $regex: search, $options: 'i' };
        }

        // Filter by Active Status
        if (typeof isActive === 'boolean') {
            query.isActive = isActive;
        }

        // Filter by Discount Type
        if (discountType) {
            query.discountType = discountType;
        }

        // Filter by Date Range (created or valid duration?) - usually validity
        // Checking if today is within validity or just filtering by creation?
        // Let's assume generic date filtering on 'createdAt' or validity if specified.
        // User asked for "filters", usually business wants to see expiry. 
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const coupons = await Coupon.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Coupon.countDocuments(query);

        sendSuccess(res, {
            coupons,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        }, 'Coupons fetched successfully');
    } catch (error: any) {
        sendError(res, 'Failed to fetch coupons', 500, error.message);
    }
};
