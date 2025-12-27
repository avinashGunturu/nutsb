import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
    identifier: string; // Phone or Email
    type: 'phone' | 'email';
    otp: string;
    expiresAt: Date;
    createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
    {
        identifier: { type: String, required: true, index: true },
        type: { type: String, enum: ['phone', 'email'], required: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true, expires: 0 }, // TTL index
    },
    { timestamps: true }
);

export default mongoose.model<IOtp>('Otp', OtpSchema);
