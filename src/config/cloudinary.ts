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
  console.warn('⚠️  Missing Cloudinary configuration:');
  console.warn('CLOUDINARY_CLOUD_NAME:', cloudinaryConfig.cloud_name ? '✓' : '✗');
  console.warn('CLOUDINARY_API_KEY:', cloudinaryConfig.api_key ? '✓' : '✗');
  console.warn('CLOUDINARY_API_SECRET:', cloudinaryConfig.api_secret ? '✓' : '✗');
  console.warn('⚠️  Image uploads will not work until Cloudinary is configured.');
} else {
  try {
    cloudinary.config(cloudinaryConfig);
    console.log('✅ Cloudinary configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure Cloudinary:', error);
  }
}

export { cloudinary };