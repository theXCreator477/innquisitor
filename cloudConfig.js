const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Project_BNB',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
  },
});

module.exports = {
    cloudinary, 
    storage
};