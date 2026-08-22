const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// ================= SEND OTP =================
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: "Contact number must be exactly 10 digits" });
        }

        const userExists = await pool.query("SELECT * FROM users WHERE phone_number = $1", [phone]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "User with this phone number already exists" });
        }

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await pool.query(
            "INSERT INTO otp_verifications (phone_number, otp) VALUES ($1, $2) ON CONFLICT (phone_number) DO UPDATE SET otp = $2, created_at = CURRENT_TIMESTAMP",
            [phone, generatedOtp]
        );

        console.log(`\n\n---------------------------\n🛡️ MOCK OTP for ${phone}: ${generatedOtp}\n---------------------------\n\n`);

        res.json({ message: "OTP sent successfully (Check server terminal for Mock OTP)" });
    } catch (error) {
        console.error("OTP Error:", error);
        res.status(500).json({ message: "Error generating OTP" });
    }
});

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, bloodGroup, city, dob, health_info, hospital_registration_number, phone_number, phone, otp } = req.body;

    const contactPhone = phone_number || phone;

    if (!/^\d{10}$/.test(contactPhone)) {
      return res.status(400).json({ message: "Contact number must be exactly 10 digits" });
    }

    // Check if user already exists with email OR phone
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone_number = $2',
      [email, contactPhone]
    );

    if (userExists.rows.length > 0) {
      if (userExists.rows[0].email === email) {
        return res.status(400).json({ message: "User with this email already exists" });
      } else {
        return res.status(400).json({ message: "User with this phone number already exists" });
      }
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role = user if not provided
    const userRole = role || 'user';

    // Verify OTP for user role
    if (userRole === 'user') {
        if (!otp) return res.status(400).json({ message: "OTP is required for registration" });
        
        const otpCheck = await pool.query("SELECT * FROM otp_verifications WHERE phone_number = $1", [contactPhone]);
        if (otpCheck.rows.length === 0 || otpCheck.rows[0].otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        
        // Delete OTP after checking
        await pool.query("DELETE FROM otp_verifications WHERE phone_number = $1", [contactPhone]);
    }


    // Insert User with NEW FIELDS
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role, blood_group, city, dob, health_info, hospital_registration_number, phone_number, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true) RETURNING id, name, email, role, phone_number',
      [name, email, hashedPassword, userRole, bloodGroup, city, dob, health_info, hospital_registration_number, contactPhone]
    );

    res.status(201).json({
      message: "User registered successfully.",
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create token WITH ROLE
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role   // 👈 This will show in response
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;