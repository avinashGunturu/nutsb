import mongoose, { Schema, Document } from 'mongoose';

export interface IContactRequest extends Document {
    name: string;
    email: string;
    phone?: string;
    orderId?: string; // User entered Order #
    topic: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    createdAt: Date;
    updatedAt: Date;
}

const ContactRequestSchema = new Schema<IContactRequest>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        orderId: { type: String },
        topic: { type: String, default: 'General Inquiry' },
        message: { type: String, required: true },
        status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
    },
    { timestamps: true }
);

export default mongoose.model<IContactRequest>('ContactRequest', ContactRequestSchema);
