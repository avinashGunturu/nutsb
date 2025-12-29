import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import Transaction from '../models/Transaction';
import Coupon from '../models/Coupon';
import razorpay from '../config/razorpay';
import { sendSuccess, sendError } from '../utils/apiResponse';

// @desc    Initiate Checkout (Create Order & Razorpay Order)
// @route   POST /api/orders/checkout/initiate
// @access  Private
export const initiateCheckout = async (req: Request | any, res: Response) => {
    try {
        const { items, shippingAddress, couponCode } = req.body;
        const userId = req.user.id; // From middleware

        if (!items || items.length === 0) {
            return sendError(res, 'No items in cart', 400);
        }

        // 1. Validate Items & Calc Total
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return sendError(res, `Product not found: ${item.productId}`, 404);
            }

            // Find specific variant
            const variant = product.variants.find((v: any) => v._id.toString() === item.variantId);

            if (!variant) {
                return sendError(res, `Variant not found for product: ${item.productId}`, 400);
            }

            if (variant.stock < item.quantity) {
                return sendError(res, `Insufficient stock for ${product.name} (${variant.weight})`, 400);
            }

            const price = variant.discountedPrice || variant.price;
            subtotal += price * item.quantity;

            orderItems.push({
                product: product._id,
                variantId: (variant as any)._id,
                weight: variant.weight,
                quantity: item.quantity,
                price,
                discountApplied: variant.discountedPrice ? variant.price - variant.discountedPrice : 0,
            });
        }

        // 2. Apply Coupon
        let discountAmount = 0;
        let couponId = undefined;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            if (coupon) {
                // ... (Validate coupon logic here simplified, usually re-validate)
                if (coupon.discountType === 'percentage') {
                    discountAmount = (subtotal * coupon.discountValue) / 100;
                    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) discountAmount = coupon.maxDiscountAmount;
                } else {
                    discountAmount = coupon.discountValue;
                }
                couponId = coupon._id;
            }
        }

        const finalAmount = subtotal - discountAmount;

        // 3. Create Local Order (Pending)
        const orderId = `KC-${Date.now()}`; // Simple ID gen
        const newOrder = await Order.create({
            orderId,
            user: userId,
            items: orderItems,
            totalAmount: subtotal,
            finalAmount, // Amount to pay
            couponApplied: couponId,
            status: 'pending',
            shippingAddress: {
                ...shippingAddress,
                type: 'shipping',
                isDefault: false
            },
            paymentInfo: { status: 'pending' }
        });

        // 4. Create Razorpay Order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(finalAmount * 100), // paise
            currency: 'INR',
            receipt: orderId,
            notes: { userId },
        });

        // 5. Update Local Order with Razorpay ID
        newOrder.paymentInfo.razorpayOrderId = razorpayOrder.id;
        await newOrder.save();

        sendSuccess(res, {
            orderId: newOrder.orderId,
            razorpayOrderId: razorpayOrder.id,
            amount: finalAmount,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID,
            mongoOrderId: newOrder._id
        }, 'Checkout initiated');

    } catch (error: any) {
        sendError(res, 'Checkout initiation failed', 500, error.message);
    }
};

// @desc    Verify Payment
// @route   POST /api/orders/checkout/verify
// @access  Private
export const verifyPayment = async (req: Request | any, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, mongoOrderId } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment Success
            const order = await Order.findById(mongoOrderId);
            if (!order) return sendError(res, 'Order not found', 404);

            order.paymentInfo = {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                status: 'success',
                method: 'razorpay'
            };
            order.status = 'processing';
            await order.save();

            // Log Transaction
            await Transaction.create({
                user: req.user.id,
                order: order._id,
                gateway: 'razorpay',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                amount: order.finalAmount,
                status: 'success'
            });
            // Reduce Stock logic here (optional)

            sendSuccess(res, { orderId: order.orderId }, 'Payment successful, order validated');
        } else {
            // Payment Failed
            await Transaction.create({
                user: req.user.id,
                gateway: 'razorpay',
                orderId: razorpay_order_id,
                amount: 0, // Unknown or fetch from order
                status: 'failed',
                failureReason: 'Signature mismatch'
            });
            sendError(res, 'Payment verification failed', 400);
        }
    } catch (error: any) {
        sendError(res, 'Payment verification error', 500, error.message);
    }
};

// @desc    Get My Orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req: Request | any, res: Response) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        sendSuccess(res, orders, 'User orders fetched');
    } catch (error: any) {
        sendError(res, 'Failed to fetch orders', 500, error.message);
    }
}

// @desc    Get All Orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
        sendSuccess(res, orders, 'All orders fetched');
    } catch (error: any) {
        sendError(res, 'Failed to fetch orders', 500, error.message);
    }
};

// @desc    Update Order Status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return sendError(res, 'Order not found', 404);
        sendSuccess(res, order, 'Order status updated');
    } catch (error: any) {
        sendError(res, 'Failed to update status', 500, error.message);
    }
}
