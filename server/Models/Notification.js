const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  parentEmail: { type: String, required: true },
  childName: { type: String, required: true },
  message: { type: String, required: true },
  hospitalName: { type: String, default: "VacciCare Hospital" },
  doctorName: { type: String, default: "Dr. Sharan Angadi" },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);