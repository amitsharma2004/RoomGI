import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS URLs
});

// Create Cloudinary storage for Multer
export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'roomgi/properties', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    transformation: [
      { width: 1200, height: 800, crop: 'limit' }, // Resize large images
      { quality: 'auto' }, // Auto optimize quality
      { fetch_format: 'auto' } // Auto format (WebP when supported)
    ],
    public_id: (req: any, file: any) => {
      // Generate unique public ID
      return `property_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
  } as any,
});

export { cloudinary };