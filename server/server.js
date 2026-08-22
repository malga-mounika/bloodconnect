const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes'); // 👑 NEW
const hospitalRoutes = require('./routes/hospitalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const verifyToken = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} [${res.statusCode}] - ${duration}ms`);
  });
  next();
});


// ✅ Test Route
app.get('/', (req, res) => {
  res.send("Server is running 🚀");
});


// ✅ Auth Routes
app.use('/api', authRoutes);

// ✅ Donor Routes
app.use('/api', donorRoutes);

// ✅ Blood Request Routes
app.use('/api', requestRoutes);

// 👑 Admin Routes (NEW)
app.use('/api', adminRoutes);

// 🏥 Hospital Routes
app.use('/api/hospital', hospitalRoutes);

// 🔔 Notification Routes
app.use('/api/notifications', notificationRoutes);


// ✅ Protected Profile Route
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, blood_group, city, dob, health_info, phone_number FROM users WHERE id = $1", [req.user.id]);
    res.json({
      message: "Profile data fetched",
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// ✅ Update Profile Route
app.put('/api/profile/update', verifyToken, async (req, res) => {
  try {
    const { name, blood_group, city, dob, health_info, phone_number } = req.body;
    await pool.query(
      "UPDATE users SET name = $1, blood_group = $2, city = $3, dob = $4, health_info = $5, phone_number = $6 WHERE id = $7",
      [name, blood_group, city, dob, health_info, phone_number, req.user.id]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});