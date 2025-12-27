import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { sendSuccess, sendError } from '../utils/apiResponse';

// Multer Storage Config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file: Express.Multer.File, cb: any) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

export const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// @desc    Upload Image
// @route   POST /api/upload
// @access  Private (Admin only preferred or any auth user?)
// Let's allow authenticated users for now if they need to upload avatar, or keep it admin/protected
export const uploadImage = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return sendError(res, 'No file uploaded', 400);
        }
        // Return absolute URL or relative path
        // Assuming server serves /uploads static
        const url = `/uploads/${req.file.filename}`;
        sendSuccess(res, { url }, 'Image uploaded');
    } catch (error: any) {
        sendError(res, 'Upload failed', 500, error.message);
    }
};
