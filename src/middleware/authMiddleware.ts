import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const protect = (req: Request | any, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // { id: string, role: string }
            next();
        } catch (error) {
            return sendError(res, 'Not authorized, token failed', 401);
        }
    }

    if (!token) {
        return sendError(res, 'Not authorized, no token', 401);
    }
};

export const admin = (req: Request | any, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'wholesale_manager')) { // Allow managers too or strict?
        next();
    } else {
        return sendError(res, 'Not authorized as an admin', 403);
    }
};
