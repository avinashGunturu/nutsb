import { Storage } from '@google-cloud/storage';
import path from 'path';

// Initialize GCS
// It will look for GOOGLE_APPLICATION_CREDENTIALS in env
const storage = new Storage();

const bucketName = process.env.GCS_BUCKET_NAME || 'kcnuts-assets';
const bucket = storage.bucket(bucketName);

export { storage, bucket, bucketName };
