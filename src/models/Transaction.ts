import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    user: mongoose.Types.ObjectId;
    order?: mongoose.Types.ObjectId;
    gateway: 'razorpay' | 'manual';
    paymentId?: string; // Razorpay Payment ID
    orderId?: string; // Razorpay Order ID
    amount: number;
    currency: string;
    status: 'initiated' | 'success' | 'failed' | 'refunded';
    failureReason?: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        order: { type: Schema.Types.ObjectId, ref: 'Order' },
        gateway: { type: String, enum: ['razorpay', 'manual'], default: 'razorpay' },
        paymentId: { type: String },
        orderId: { type: String },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        status: {
            type: String,
            enum: ['initiated', 'success', 'failed', 'refunded'],
            default: 'initiated',
        },
        failureReason: { type: String },
        metadata: { type: Object }, // Store full gateway response
    },
    { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
