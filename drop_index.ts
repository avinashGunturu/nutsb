import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('products');

        // List indexes to confirm
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        try {
            await collection.dropIndex('sku_1');
            console.log('Successfully dropped index "sku_1"');
        } catch (e: any) {
            console.log('Index "sku_1" might not exist or already dropped:', e.message);
        }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dropIndex();
