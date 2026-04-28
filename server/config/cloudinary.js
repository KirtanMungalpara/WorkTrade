const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Multer Storage Engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'worktrade_requests',
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp3', 'wav', 'm4a'],
    resource_type: 'auto' // This allows non-image files like audio
  }
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
