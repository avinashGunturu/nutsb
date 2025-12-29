import { Request, Response } from 'express';
import WholesaleInquiry from '../models/WholesaleInquiry';
import { sendSuccess, sendError } from '../utils/apiResponse';

// @desc    Submit Wholesale Inquiry
// @route   POST /api/wholesale/inquiry
// @access  Public
export const submitInquiry = async (req: Request, res: Response) => {
    try {
        const { name, email, companyName, gstNumber, mobile, requirements } = req.body;

        // 1. Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return sendError(res, 'Invalid email address.', 400);
        }

        // 2. Validate Indian Mobile Number (6-9 followed by 9 digits)
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobile)) {
            return sendError(res, 'Invalid mobile number. Please enter a valid 10-digit Indian number.', 400);
        }

        // 3. Validate GST Number (Optional but if provided must be valid)
        // Format: 2 digits + 5 letters + 4 digits + 1 letter + 1 number/letter + Z + 1 number/letter
        if (gstNumber) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(gstNumber)) {
                return sendError(res, 'Invalid GST Number format.', 400);
            }
        }

        const inquiry = await WholesaleInquiry.create({
            name,
            email,
            companyName,
            gstNumber,
            mobile,
            requirements
        });

        sendSuccess(res, inquiry, 'Inquiry submitted successfully', 201);
    } catch (error: any) {
        sendError(res, 'Failed to submit inquiry', 500, error.message);
    }
};

// @desc    Get All Wholesale Inquiries with Filters & Pagination
// @route   POST /api/wholesale/filter
// @access  Private/Admin
export const getInquiries = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search, status, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = req.body;

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Build Query Object
        const query: any = {};

        // 1. Status Filter
        if (status) {
            query.status = status;
        }

        // 2. Search (Name, Email, Mobile, Company, Requirements, GST)
        if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { mobile: searchRegex },
                { companyName: searchRegex },
                { requirements: searchRegex },
                { gstNumber: searchRegex }
            ];
        }

        // 3. Date Range Filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate as string);
            }
            if (endDate) {
                // Set end date to end of the day
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Execute Query
        const inquiries = await WholesaleInquiry.find(query)
            .sort({ [sortBy as string]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limitNum);

        // Get Total Count for Pagination
        const total = await WholesaleInquiry.countDocuments(query);

        sendSuccess(res, {
            inquiries,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        }, 'Wholesale inquiries fetched successfully');

    } catch (error: any) {
        sendError(res, 'Failed to fetch inquiries', 500, error.message);
    }
};
