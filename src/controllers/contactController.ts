import { Request, Response } from 'express';
import ContactRequest from '../models/ContactRequest';
import { sendSuccess, sendError } from '../utils/apiResponse';

// @desc    Submit Contact Request
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req: Request, res: Response) => {
    try {
        const contact = await ContactRequest.create(req.body);
        sendSuccess(res, contact, 'Message sent successfully', 201);
    } catch (error: any) {
        sendError(res, 'Failed to send message', 500, error.message);
    }
};

// @desc    Get All Contact Requests with Filters & Pagination
// @route   GET /api/admin/leads/contact
// @access  Private/Admin
export const getContactRequests = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search, status, topic, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = req.body;

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Build Query Object
        const query: any = {};

        // 1. Status Filter
        if (status) {
            query.status = status;
        }

        // 2. Topic Filter
        if (topic) {
            query.topic = topic;
        }

        // 3. Search (Name, Email, Phone, OrderId, Message)
        if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { orderId: searchRegex },
                { message: searchRegex }
            ];
        }

        // 4. Date Range Filter
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
        const requests = await ContactRequest.find(query)
            .sort({ [sortBy as string]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limitNum);

        // Get Total Count for Pagination
        const total = await ContactRequest.countDocuments(query);

        sendSuccess(res, {
            requests,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        }, 'Contact requests fetched successfully');

    } catch (error: any) {
        sendError(res, 'Failed to fetch requests', 500, error.message);
    }
};
