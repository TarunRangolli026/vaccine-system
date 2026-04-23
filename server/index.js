const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('./Models/User');
const Appointment = require('./Models/Appointment');
const Notification = require('./Models/Notification');

const app = express();
app.use(express.json());
app.use(cors());

// --- PASSWORD VALIDATION HELPER ---
// Min 8 characters, at least 1 uppercase letter, and 1 special character
const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,15})/;
  return regex.test(password);
};

// --- MONGODB CONNECTION ---
mongoose.connect('mongodb://127.0.0.1:27017/vacci_care_new')
  .then(() => console.log("✅ Connected to New Database: vacci_care_new"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- 1. SIGNUP (UPDATED WITH CONSTRAINTS) ---
app.post('/api/signup', async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    // Check password constraints
    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long, include one uppercase letter, and one special character (!@#$%^&*)" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, fullName, role: 'parent' });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error during signup" });
  }
});

// --- 2. LOGIN ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.status(200).json(user); 
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});

// --- 9. FORGOT PASSWORD ---
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    console.log("Attempting password reset for:", email);
    const user = await User.findOne({ email });
    
    if (!user) {
        console.log("User not found in database");
        return res.status(404).json({ error: "User with this email does not exist." });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tarunrangolli@gmail.com',
        pass: 'bivc gfof ouxg faje' 
      }
    });

    const resetUrl = `http://localhost:3000/reset-password/${token}`;

    const mailOptions = {
      from: '"Vacci_Care Support" <tarunrangolli@gmail.com>',
      to: user.email,
      subject: 'Password Reset Request - Vacci_Care',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6a1b9a;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for Vacci_Care. Click the button below to continue:</p>
          <a href="${resetUrl}" style="background-color: #6a1b9a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Reset Password</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Reset email sent to:", user.email);
    res.status(200).json({ message: "Reset link sent to your email!" });

  } catch (err) {
    console.error("❌ FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ error: "Failed to process: " + err.message });
  }
});

// --- 10. RESET PASSWORD (UPDATED WITH CONSTRAINTS) ---
app.post('/api/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  try {
    // Check password constraints
    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long, include one uppercase letter, and one special character (!@#$%^&*)" });
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: "Token is invalid or has expired" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// --- 3. GET PROFILE ---
app.get('/api/get-profile/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- 4. SAVE PROFILE ---
app.post('/api/update-profile', async (req, res) => {
  const { email, fullName, phone, numChildren, children } = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { fullName, phone, numChildren, children } },
      { upsert: true, new: true } 
    );
    res.status(200).json(updatedUser); 
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- 5. BOOK APPOINTMENT ---
app.post('/api/book-appointment', async (req, res) => {
    try {
        const { parentEmail, parentName, childName, vaccineName, appointmentDate, timeSlot } = req.body;
        
        const newAppointment = new Appointment({
            parentEmail,
            parentName, 
            childName,
            vaccineName,
            appointmentDate,
            timeSlot,
            status: "pending"
        });
        await newAppointment.save();

        await User.updateOne(
          { email: parentEmail, "children.name": childName },
          { 
            $set: { 
              "children.$.pendingAppointment": {
                vaccineName,
                date: appointmentDate,
                timeSlot,
                status: "pending"
              } 
            } 
          }
        );

        res.status(200).json({ message: "Appointment saved!" });
    } catch (err) {
        res.status(500).json({ error: "Booking Failed" });
    }
});

// --- 6. ADMIN: GET ALL APPOINTMENTS ---
app.get('/api/admin/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointment records" });
  }
});

// --- 7. ADMIN: UPDATE STATUS ---
app.put('/api/admin/update-appointment', async (req, res) => {
    const { appointmentId, status } = req.body;
    try {
        const updatedAppt = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: status },
            { new: true }
        );

        await User.updateOne(
            { "children.pendingAppointment.vaccineName": updatedAppt.vaccineName, email: updatedAppt.parentEmail },
            { $set: { "children.$.pendingAppointment.status": status } }
        );

        res.status(200).json({ message: "Status updated successfully", updatedAppt });
    } catch (err) {
        res.status(500).json({ error: "Failed to update status" });
    }
});

// --- 8. NOTIFICATIONS ---
app.post('/api/admin/send-notif', async (req, res) => {
  try {
    const { parentEmail, childName, message } = req.body;
    const newNotif = new Notification({
      parentEmail, childName, message, status: 'unread'
    });
    await newNotif.save();
    res.status(200).json({ success: true, message: "Reminder sent!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send notification" });
  }
});

app.get('/api/user/notifications/:email', async (req, res) => {
  try {
    const messages = await Notification.find({ parentEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Fetch error" });
  }
});

app.put('/api/user/mark-read/:id', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { status: 'read' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.listen(5000, () => console.log(`🚀 Server running on port 5000`));