import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
    type: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
}

export interface IUser extends Document {
    name: string;
    email?: string;
    phone?: string;
    password?: string;
    role: 'customer' | 'admin' | 'wholesale_manager' | 'support';
    permissions: string[];
    addresses: IAddress[];
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
    type: { type: String, enum: ['home', 'work', 'billing', 'other'], default: 'home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
        phone: { type: String, unique: true, sparse: true, trim: true },
        password: { type: String, select: false }, // Hashed
        role: {
            type: String,
            enum: ['customer', 'admin', 'wholesale_manager', 'support'],
            default: 'customer',
        },
        permissions: [{ type: String }], // e.g., 'manage_products', 'view_orders'
        addresses: [AddressSchema],
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

export default mongoose.model<IUser>('User', UserSchema);
