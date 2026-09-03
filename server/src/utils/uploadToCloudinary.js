const cloudinary = require('../config/cloudinary.js');

// Wraps Cloudinary's stream-based upload in a Promise so we can use async/await in controllers
const uploadBufferToCloudinary = (buffer, folder = 'saree-products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = uploadBufferToCloudinary;