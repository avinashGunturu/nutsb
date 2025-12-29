import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './User';

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    variantId?: string; // ID of the specific variant
    weight?: string;
    quantity: number;
    price: number;
    discountApplied: number;
}

export interface IPaymentInfo {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: string;
    method?: string;
}

export interface IOrder extends Document {
    orderId: string;
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    finalAmount: number;
    couponApplied?: mongoose.Types.ObjectId;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: IAddress;
    paymentInfo: IPaymentInfo;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
    {
        orderId: { type: String, required: true, unique: true, index: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                variantId: { type: String },
                weight: { type: String },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true }, // Price at time of purchase
                discountApplied: { type: Number, default: 0 },
            },
        ],
        totalAmount: { type: Number, required: true },
        finalAmount: { type: Number, required: true },
        couponApplied: { type: Schema.Types.ObjectId, ref: 'Coupon' },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true },
            country: { type: String, required: true },
            type: { type: String, default: 'shipping' },
            isDefault: { type: Boolean, default: false },
        },
        paymentInfo: {
            razorpayOrderId: { type: String },
            razorpayPaymentId: { type: String },
            status: { type: String, default: 'pending' },
            method: { type: String },
        },
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
