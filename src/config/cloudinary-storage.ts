import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import multer from 'multer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Custom Cloudinary storage for multer
class CloudinaryStorage {
  constructor(private options: { folder?: string; allowedFormats?: string[] }) {
    // Validate Cloudinary configuration on initialization
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration missing. Please check your environment variables.');
    }
  }

  _handleFile(req: Request, file: Express.Multer.File, cb: (error: any, info?: any) => void) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: this.options.folder || 'roomgi',
        allowed_formats: this.options.allowedFormats || ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          cb(error);
        } else {
          cb(null, {
            url: result?.secure_url,
            public_id: result?.public_id,
            filename: result?.public_id,
            path: result?.secure_url
          });
        }
      }
    );

    file.stream.pipe(uploadStream);
  }

  _removeFile(req: Request, file: any, cb: (error: Error | null) => void) {
    if (file.public_id) {
      cloudinary.uploader.destroy(file.public_id, (error: any) => {
        cb(error);
      });
    } else {
      cb(null);
    }
  }
}

export const cloudinaryStorage = (options: { folder?: string; allowedFormats?: string[] } = {}) => {
  return new CloudinaryStorage(options);
};