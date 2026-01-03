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

// @desc    Get All Customers with Filters
// @route   POST /api/admin/customers
// @access  Private/Admin
export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.body;

        const query: any = { role: 'customer' };

        // Search Filter
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ];
        }

        // Status Filter (Active = Verified Email or Phone)
        if (status) {
            if (status === 'Active') {
                query.$or = [
                    { isEmailVerified: true },
                    { isPhoneVerified: true }
                ];
            } else if (status === 'Inactive') {
                query.isEmailVerified = { $ne: true };
                query.isPhoneVerified = { $ne: true };
            }
        }

        // Pagination
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        // Fetch Users
        const customers = await User.find(query)
            .select('-password') // Exclude password
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(); // Convert to plain JS objects for modification

        const total = await User.countDocuments(query);

        // Fetch Order Counts for these customers
        const customerIds = customers.map(c => c._id);

        const orderCounts = await Order.aggregate([
            { $match: { user: { $in: customerIds } } },
            { $group: { _id: '$user', count: { $sum: 1 } } }
        ]);

        // Map order counts to customers
        const orderCountMap = new Map();
        orderCounts.forEach(item => {
            orderCountMap.set(item._id.toString(), item.count);
        });

        const formattedCustomers = customers.map((c: any) => ({
            _id: c._id,
            name: c.name,
            email: c.email || '',
            phone: c.phone || '',
            status: (c.isEmailVerified || c.isPhoneVerified) ? 'Active' : 'Inactive',
            joined: c.createdAt,
            orders: orderCountMap.get(c._id.toString()) || 0
        }));

        sendSuccess(res, {
            customers: formattedCustomers,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        }, 'Customers fetched successfully');

    } catch (error: any) {
        sendError(res, 'Failed to fetch customers', 500, error.message);
    }
};
// @desc    Get Single Customer Details
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user || user.role !== 'customer') {
            return sendError(res, 'Customer not found', 404);
        }

        // Get Order Stats
        const orderStats = await Order.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$finalAmount' },
                    lastOrderDate: { $max: '$createdAt' }
                }
            }
        ]);

        const stats = orderStats.length > 0 ? orderStats[0] : { totalOrders: 0, totalSpent: 0, lastOrderDate: null };

        // Get recent orders for this customer (optional, but good for details page)
        // const recentOrders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5);

        const customerDetails = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: (user.isEmailVerified || user.isPhoneVerified) ? 'Active' : 'Inactive',
            joined: user.createdAt,
            avatar: user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
            bio: 'No bio available', // Placeholder or add field to model
            address: user.addresses && user.addresses.length > 0
                ? user.addresses.find((a: any) => a.isDefault) || user.addresses[0]
                : null,
            stats: {
                orders: stats.totalOrders,
                totalSpent: stats.totalSpent,
                lastOrderDate: stats.lastOrderDate,
            }
        };

        sendSuccess(res, customerDetails, 'Customer details fetched');

    } catch (error: any) {
        sendError(res, 'Failed to fetch customer details', 500, error.message);
    }
};
