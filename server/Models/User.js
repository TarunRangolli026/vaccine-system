const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'parent' }, 
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    numChildren: { type: Number, default: 1 },
    children: [
        {
            name: { type: String, default: '' },
            dob: { type: String, default: '' },
            gender: { type: String, default: '' },
            weight: { type: String, default: '' },
            age: { type: String, default: '' },
            // --- NEW FIELDS TO PERSIST DATA ---
            // Stores the current scheduled vaccine, date, and time
            pendingAppointment: { 
                type: Object, 
                default: null 
            },
            // Stores the history of alerts/messages for this specific child
            notifications: { 
                type: Array, 
                default: [] 
            }
        }
    ],
    // --- STEP 1: ADDED FORGOT PASSWORD FIELDS ---
    resetPasswordToken: { 
        type: String, 
        default: null 
    },
    resetPasswordExpires: { 
        type: Date, 
        default: null 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);