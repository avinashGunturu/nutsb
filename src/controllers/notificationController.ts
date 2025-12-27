import { Request, Response } from 'express';
import NotificationTemplate from '../models/NotificationTemplate';
import { sendSuccess, sendError } from '../utils/apiResponse';

// @desc    Create Notification Template
// @route   POST /api/admin/notifications/templates
// @access  Private/Admin
export const createTemplate = async (req: Request, res: Response) => {
    try {
        const template = await NotificationTemplate.create(req.body);
        sendSuccess(res, template, 'Template created successfully', 201);
    } catch (error: any) {
        sendError(res, 'Failed to create template', 500, error.message);
    }
};

// @desc    Get All Templates
// @route   GET /api/admin/notifications/templates
// @access  Private/Admin
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await NotificationTemplate.find();
        sendSuccess(res, templates, 'Templates fetched');
    } catch (error: any) {
        sendError(res, 'Failed to fetch templates', 500, error.message);
    }
};

// @desc    Send Notification (Mock)
// @route   POST /api/admin/notifications/send
// @access  Private/Admin
export const sendNotification = async (req: Request, res: Response) => {
    try {
        const { type, to, templateName, variables } = req.body;

        // logic to fetch template and replace variables would go here
        // For now, just logging
        console.log(`Sending ${type} to ${to} using ${templateName}`, variables);

        sendSuccess(res, { status: 'queued' }, 'Notification sent successfully');
    } catch (error: any) {
        sendError(res, 'Failed to send notification', 500, error.message);
    }
}
