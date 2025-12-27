import mongoose, { Schema, Document } from 'mongoose';

export interface IWholesaleInquiry extends Document {
    name: string;
    email: string;
    companyName: string;
    gstNumber?: string;
    mobile: string;
    requirements: string;
    status: 'new' | 'contacted' | 'converted' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}

const WholesaleInquirySchema = new Schema<IWholesaleInquiry>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        companyName: { type: String, required: true },
        gstNumber: { type: String },
        mobile: { type: String, required: true },
        requirements: { type: String, required: true },
        status: {
            type: String,
            enum: ['new', 'contacted', 'converted', 'closed'],
            default: 'new',
        },
    },
    { timestamps: true }
);

export default mongoose.model<IWholesaleInquiry>('WholesaleInquiry', WholesaleInquirySchema);
