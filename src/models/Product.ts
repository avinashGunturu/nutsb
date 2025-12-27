import mongoose, { Schema, Document } from 'mongoose';

export interface IReview {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
}

export interface IProduct extends Document {
    name: string;
    description: string;
    sku: string;
    price: number; // Retail Price
    wholesalePrice?: number; // B2B Price
    discountedPrice?: number;
    weight: string;
    category: string;
    images: { url: string; alt: string; isPrimary: boolean }[];
    stock: number;
    isNew: boolean;
    rating: number;
    reviews: IReview[];
    availableFor: ('customer' | 'wholesale')[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, index: true },
        description: { type: String, required: true },
        sku: { type: String, required: true, unique: true, index: true },
        price: { type: Number, required: true },
        wholesalePrice: { type: Number },
        discountedPrice: { type: Number },
        weight: { type: String, required: true }, // e.g., "500g", "1kg"
        category: { type: String, required: true, index: true },
        images: [
            {
                url: { type: String, required: true },
                alt: { type: String },
                isPrimary: { type: Boolean, default: false },
            },
        ],
        stock: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        reviews: [
            {
                user: { type: Schema.Types.ObjectId, ref: 'User' },
                rating: { type: Number, required: true },
                comment: { type: String },
                date: { type: Date, default: Date.now },
            },
        ],
        availableFor: {
            type: [String],
            enum: ['customer', 'wholesale'],
            default: ['customer'],
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
