const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    parentEmail: { type: String, required: true },
    childName: { type: String, required: true },
    vaccineName: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, default: 'Confirmed' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);