import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message: string = 'Success', statusCode: number = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const sendError = (res: Response, message: string, statusCode: number = 500, error: any = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: error ? { code: error.code || 'INTERNAL_ERROR', details: error } : undefined,
    });
};
