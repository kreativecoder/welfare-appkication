import { config as envConfig } from 'dotenv';

import multer from 'multer';
const cloudinary = require('cloudinary').v2;
import { CloudinaryStorage } from 'multer-storage-cloudinary';

envConfig();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: () => 'cooporative-app',
    format: async () => 'png',
    public_id: (req, file) => file.originalname,
  },
});

const parser = multer({ storage });

export default parser;