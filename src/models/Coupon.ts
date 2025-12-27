import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue: number;
    maxDiscountAmount?: number;
    validFrom: Date;
    validUntil: Date;
    usageLimit: number;
    usedCount: number;
    applicableTo: 'all' | 'specific_users';
    assignedUsers: mongoose.Types.ObjectId[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
        discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
        discountValue: { type: Number, required: true },
        minOrderValue: { type: Number, default: 0 },
        maxDiscountAmount: { type: Number }, // Cap for percentage discounts
        validFrom: { type: Date, default: Date.now },
        validUntil: { type: Date, required: true },
        usageLimit: { type: Number, default: 1000 },
        usedCount: { type: Number, default: 0 },
        applicableTo: { type: String, enum: ['all', 'specific_users'], default: 'all' },
        assignedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
