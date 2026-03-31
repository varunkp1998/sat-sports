const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'dr6q4ou54',
  api_key: '712546846215731',
  api_secret: '_QU_qDr6EuzvkT01sd-Px1uWUZw'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sat_sports_checkins', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const uploadCloud = multer({ storage: storage });

module.exports = uploadCloud;