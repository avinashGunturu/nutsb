import { Request, Response } from 'express';
import WholesaleInquiry from '../models/WholesaleInquiry';
import { sendSuccess, sendError } from '../utils/apiResponse';

// @desc    Submit Wholesale Inquiry
// @route   POST /api/wholesale/inquiry
// @access  Public
export const submitInquiry = async (req: Request, res: Response) => {
    try {
        const inquiry = await WholesaleInquiry.create(req.body);
        sendSuccess(res, inquiry, 'Inquiry submitted successfully', 201);
    } catch (error: any) {
        sendError(res, 'Failed to submit inquiry', 500, error.message);
    }
};

// @desc    Get All Wholesale Inquiries
// @route   GET /api/admin/leads/wholesale
// @access  Private/Admin
export const getInquiries = async (req: Request, res: Response) => {
    try {
        const inquiries = await WholesaleInquiry.find().sort({ createdAt: -1 });
        sendSuccess(res, inquiries, 'Wholesale inquiries fetched');
    } catch (error: any) {
        sendError(res, 'Failed to fetch inquiries', 500, error.message);
    }
};
