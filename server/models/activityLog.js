const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

// Encryption Configuration
const algorithm = 'aes-256-cbc'; // AES encryption algorithm
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes (256 bits)
const ivLength = 16; // Initialization vector length
const generateIv = () => crypto.randomBytes(ivLength); // Generates a new IV for each encryption

// Helper functions for encryption and decryption
function encryptData(data) {
  if (!data) return null; // Handle null/undefined data
  const iv = generateIv();
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`; // Store IV with encrypted data
}

function decryptData(encryptedData) {
  if (!encryptedData) return null; // Handle null/undefined data
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted); // Parse JSON back to original object
}

// Schema definition
const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: Object
  },
}, { timestamps: true });

// Pre-save hook to encrypt data
activityLogSchema.pre('save', function (next) {
  this.action = encryptData(this.action);
  this.details = encryptData(this.details);
  next();
}); 

// Post-init hook to decrypt data
activityLogSchema.post('init', function () {
  this.action = decryptData(this.action);
  this.details = decryptData(this.details);
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
