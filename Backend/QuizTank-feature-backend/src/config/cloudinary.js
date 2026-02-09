const cloudinary = require('cloudinary').v2;

// Cloudinary will automatically pick up the CLOUDINARY_URL environment variable.
// Make sure it is defined in your .env file
// Format: cloudinary://<api_key>:<api_secret>@<cloud_name>

module.exports = cloudinary;
