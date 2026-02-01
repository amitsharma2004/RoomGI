import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Configure Cloudinary with explicit error checking
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS URLs
};

// Validate configuration
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.error('Missing Cloudinary configuration:');
  console.error('CLOUDINARY_CLOUD_NAME:', cloudinaryConfig.cloud_name ? '✓' : '✗');
  console.error('CLOUDINARY_API_KEY:', cloudinaryConfig.api_key ? '✓' : '✗');
  console.error('CLOUDINARY_API_SECRET:', cloudinaryConfig.api_secret ? '✓' : '✗');
  throw new Error('Cloudinary configuration is incomplete. Please check your environment variables.');
}

cloudinary.config(cloudinaryConfig);

export { cloudinary };