import { Request, Response } from 'express';
import Product from '../models/Product';
import { sendSuccess, sendError } from '../utils/apiResponse';

// @desc    Validate Cart Items (Stock & Price Check)
// @route   POST /api/cart/validate
// @access  Public
export const validateCart = async (req: Request, res: Response) => {
    try {
        const { items } = req.body; // [{ productId, quantity }]

        if (!items || !Array.isArray(items)) {
            return sendError(res, 'Invalid items format', 400);
        }

        let subtotal = 0;
        const validatedItems = [];
        const errors = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                errors.push({ productId: item.productId, error: 'Product not found' });
                continue;
            }

            // Find specific variant
            const variant = product.variants.find((v: any) => v._id.toString() === item.variantId);

            if (!variant) {
                errors.push({ productId: item.productId, error: 'Variant not found' });
                continue;
            }

            if (variant.stock < item.quantity) {
                errors.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    error: `Insufficient stock. Only ${variant.stock} available.`,
                });
                continue;
            }

            // Use discounted price if available
            const price = variant.discountedPrice || variant.price;
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            validatedItems.push({
                product,
                variant,
                quantity: item.quantity,
                price,
                itemTotal,
            });
        }

        if (errors.length > 0) {
            return sendError(res, 'Cart validation failed for some items', 400, { errors });
        }

        sendSuccess(res, { validatedItems, subtotal }, 'Cart validated successfully');

    } catch (error: any) {
        sendError(res, 'Cart validation failed', 500, error.message);
    }
};
