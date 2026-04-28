require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary Connection...');

// Upload a simple base64 image (a tiny 1x1 pixel)
const sampleImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

cloudinary.uploader.upload(sampleImage, { folder: "worktrade_test" })
  .then(result => {
    console.log('\n✅ SUCCESS! Cloudinary is working perfectly!');
    console.log('--------------------------------------------------');
    console.log('Here is your uploaded image URL:');
    console.log(result.secure_url);
    console.log('--------------------------------------------------');
    console.log('You can click that link to see the image in your browser.');
  })
  .catch(error => {
    console.log('\n❌ ERROR! Something went wrong with Cloudinary.');
    console.log('--------------------------------------------------');
    console.error(error.message);
    console.log('--------------------------------------------------');
    console.log('Please check your .env file and make sure your keys are exactly correct.');
  });
