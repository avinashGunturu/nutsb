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
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return sendError(res, 'Product not found', 404);
        }
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
