import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationTemplate extends Document {
    name: string;
    type: 'sms' | 'email';
    subject?: string;
    content: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationTemplateSchema = new Schema<INotificationTemplate>(
    {
        name: { type: String, required: true, unique: true }, // e.g., 'order_confirmation'
        type: { type: String, enum: ['sms', 'email'], required: true },
        subject: { type: String }, // Only for email
        content: { type: String, required: true }, // Handlebars or string format
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<INotificationTemplate>(
    'NotificationTemplate',
    NotificationTemplateSchema
);
