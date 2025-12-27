import { Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';
import { sendSuccess, sendError } from '../utils/apiResponse';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();

        // Calculate Total Revenue (only paid orders)
        const revenueAgg = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' }, 'paymentInfo.status': 'success' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // Recent Orders
        const recentOrders = await Order.find()
            .populate('user', 'name') // Only select name
            .sort({ createdAt: -1 })
            .limit(5);

        sendSuccess(res, {
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue,
            recentOrders
        }, 'Dashboard stats fetched');

    } catch (error: any) {
        sendError(res, 'Failed to fetch dashboard stats', 500, error.message);
    }
};

// @desc    Update User Role & Permissions
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { role, permissions } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        // Prevent changing own role (optional safety)
        // if (req.user.id === user.id) return sendError(res, 'Cannot change your own role', 400);

        if (role) user.role = role;
        if (permissions) user.permissions = permissions;

        await user.save();

        sendSuccess(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        }, 'User role updated successfully');

    } catch (error: any) {
        sendError(res, 'Failed to update user role', 500, error.message);
    }
};
