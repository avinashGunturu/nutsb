import { Request, Response } from 'express';
import Product from '../models/Product';
import { sendSuccess, sendError } from '../utils/apiResponse';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category, type, search } = req.query;
        let query: any = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (type) {
            // type=wholesale or retail from frontend?
            // Our schema has 'availableFor'.
            query.availableFor = type === 'wholesale' ? 'wholesale' : 'customer';
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        sendSuccess(res, products, 'Products fetched successfully');
    } catch (error: any) {
        sendError(res, 'Failed to fetch products', 500, error.message);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return sendError(res, 'Product not found', 404);
        }
        sendSuccess(res, product, 'Product fetched successfully');
    } catch (error: any) {
        sendError(res, 'Failed to fetch product', 500, error.message);
    }
};

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.create(req.body);
        sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error: any) {
        sendError(res, 'Failed to create product', 500, error.message);
    }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return sendError(res, 'Product not found', 404);
        }

        // Update properties
        Object.assign(product, req.body);

        // Save triggers the pre-save hook (recalculates min price from variants)
        await product.save();

        sendSuccess(res, product, 'Product updated successfully');
    } catch (error: any) {
        sendError(res, 'Failed to update product', 500, error.message);
    }
};

// @desc    Delete a product (Soft delete)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!product) {
            return sendError(res, 'Product not found', 404);
        }
        sendSuccess(res, {}, 'Product deleted successfully');
    } catch (error: any) {
        sendError(res, 'Failed to delete product', 500, error.message);
    }
};

// @desc    Get products with filters (POST)
// @route   POST /api/products/list
// @access  Public
export const getProductsWithFilters = async (req: Request, res: Response) => {
    try {
        const { filters, page = 1, limit = 10 } = req.body;
        const { name, category, rating, isActive, type } = filters || {};

        let query: any = {};

        if (typeof isActive !== 'undefined') {
            query.isActive = isActive;
        } else {
            query.isActive = true;
        }

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        if (category) {
            if (Array.isArray(category) && category.length > 0) {
                query.category = { $in: category };
            } else if (typeof category === 'string') {
                query.category = category;
            }
        }

        if (rating) {
            query.rating = { $gte: rating };
        }

        if (type) {
            query.availableFor = type === 'wholesale' ? 'wholesale' : 'customer';
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        const sort: any = { createdAt: -1 };

        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await Product.countDocuments(query);

        sendSuccess(res, {
            products,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
        }, 'Products fetched successfully');

    } catch (error: any) {
        sendError(res, 'Failed to fetch products', 500, error.message);
    }
};
