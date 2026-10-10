import { v2 as cloudinary } from 'cloudinary';

const requiredConfig = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

export function getCloudinary() {
  const missing = requiredConfig.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const error = new Error(`Cloudinary is not configured. Missing: ${missing.join(', ')}`);
    error.statusCode = 503;
    throw error;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
}
