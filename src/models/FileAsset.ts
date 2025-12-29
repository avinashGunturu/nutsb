import mongoose, { Schema, Document } from 'mongoose';

export interface IFileAsset extends Document {
    fileName: string; // The confusing name in GCS (e.g. 17400123-image.png)
    originalName: string; // The original name user uploaded
    url: string; // Public GCS URL
    mimetype: string;
    size: number;
    uploadedBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const FileAssetSchema = new Schema<IFileAsset>(
    {
        fileName: { type: String, required: true },
        originalName: { type: String, required: true },
        url: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model<IFileAsset>('FileAsset', FileAssetSchema);
