import mongoose, { Schema, Document } from 'mongoose';

export interface IReview {
    user?: mongoose.Types.ObjectId;
    reviewerName?: string;
    rating: number;
    comment: string;
    date: Date;
}

export interface IVariant {
    weight: string;
    price: number;
    wholesalePrice?: number;
    discountedPrice?: number;
    stock: number;
    sku: string;
}

export interface IHighlight {
    text: string;
    icon?: string;
    color?: string;
}

export interface IBenefit {
    title: string;
    description?: string;
    icon?: string;
}

export interface IProduct extends Document {
    name: string;
    description: string;
    category: string;
    variants: IVariant[];


    images: { url: string; alt: string; isPrimary: boolean }[];
    isNew: boolean;
    rating: number;
    reviews: IReview[];
    availableFor: ('customer' | 'wholesale')[];
    isActive: boolean;
    highlights: IHighlight[];
    benefits: IBenefit[];
    nutritionalInfo?: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, index: true },
        description: { type: String, required: true },
        category: { type: String, required: true, index: true },
        variants: [
            {
                weight: { type: String, required: true },
                price: { type: Number, required: true },
                wholesalePrice: { type: Number },
                discountedPrice: { type: Number },
                stock: { type: Number, default: 0 },
                sku: { type: String },
            },
        ],
        // Root price/stock removed in favor of explicit variant selection


        images: [
            {
                url: { type: String, required: true },
                alt: { type: String },
                isPrimary: { type: Boolean, default: false },
            },
        ],
        rating: { type: Number, default: 0 },
        reviews: [
            {
                user: { type: Schema.Types.ObjectId, ref: 'User' },
                reviewerName: { type: String },
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
        highlights: [
            {
                text: { type: String, required: true },
                icon: { type: String },
                color: { type: String },
            },
        ],
        benefits: [
            {
                title: { type: String, required: true },
                description: { type: String },
                icon: { type: String },
            },
        ],
        nutritionalInfo: { type: Map, of: String },
    },
    { timestamps: true }
);

// Pre-save hook to automatically set the root 'price' to the lowest variant price
// Pre-save hook
ProductSchema.pre('save', async function () {
    // Logic for computed fields if any (currently none required for minimal setup)
});

export default mongoose.model<IProduct>('Product', ProductSchema);
