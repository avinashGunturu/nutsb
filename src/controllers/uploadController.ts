import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { bucket } from '../config/gcs';
import FileAsset from '../models/FileAsset';
import { sendSuccess, sendError } from '../utils/apiResponse';

// 1. Multer Memory Storage (For GCS Streaming)
const storage = multer.memoryStorage();

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
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc    Upload Image to GCS
// @route   POST /api/upload
// @access  Private (Admin)
export const uploadImage = async (req: Request | any, res: Response) => {
    try {
        if (!req.file) {
            return sendError(res, 'No file uploaded', 400);
        }

        const originalName = req.file.originalname;
        const extension = path.extname(originalName);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}${extension}`;

        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        blobStream.on('error', (err: any) => {
            console.error(err);
            sendError(res, 'Upload to cloud failed', 500, err.message);
        });

        blobStream.on('finish', async () => {
            // Make the file public (deprecated in new buckets with Uniform Level Access, but keeping for direct URL logic)
            // Ideally you set the bucket to public-read or use signed URLs.
            // If bucket is public, the URL is: https://storage.googleapis.com/BUCKET_NAME/FILE_NAME

            // For now we assume bucket is publicly readable or we just construct the public link
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            // Save Metadata to DB
            const fileAsset = await FileAsset.create({
                fileName: fileName,
                originalName: originalName,
                url: publicUrl,
                mimetype: req.file.mimetype,
                size: req.file.size,
                uploadedBy: req.user?._id
            });

            sendSuccess(res, fileAsset, 'Image uploaded successfully', 201);
        });

        blobStream.end(req.file.buffer);

    } catch (error: any) {
        sendError(res, 'Upload failed', 500, error.message);
    }
};

// @desc    Get File Details
// @route   GET /api/upload/:id
// @access  Public
export const getFileDetails = async (req: Request, res: Response) => {
    try {
        const file = await FileAsset.findById(req.params.id);
        if (!file) {
            return sendError(res, 'File not found', 404);
        }
        sendSuccess(res, file, 'File details fetched');
    } catch (error: any) {
        sendError(res, 'Failed to fetch file', 500, error.message);
    }
};

// @desc    Delete File
// @route   DELETE /api/upload/:id
// @access  Private (Admin)
export const deleteFile = async (req: Request, res: Response) => {
    try {
        const file = await FileAsset.findById(req.params.id);
        if (!file) {
            return sendError(res, 'File not found', 404);
        }

        // 1. Delete from GCS
        try {
            await bucket.file(file.fileName).delete();
        } catch (gcsError: any) {
            console.warn(`[GCS] Failed to delete file ${file.fileName} from bucket: ${gcsError.message}`);
            // Continue to delete from DB even if GCS fails (orphan cleanup)
        }

        // 2. Delete from DB
        await FileAsset.deleteOne({ _id: req.params.id });

        sendSuccess(res, {}, 'File deleted successfully');
    } catch (error: any) {
        sendError(res, 'Failed to delete file', 500, error.message);
    }
};
