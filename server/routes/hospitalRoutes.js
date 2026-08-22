const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const isHospital = require('../middleware/hospitalMiddleware');

const router = express.Router();

// ✅ Get Hospital Blood Stock
router.get('/stock', verifyToken, isHospital, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM blood_stock WHERE hospital_id = $1 ORDER BY blood_group ASC",
            [req.user.id]
        );
        res.json({ stock: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error fetching stock" });
    }
});

// ✅ Update Blood Stock
router.post('/stock/update', verifyToken, isHospital, async (req, res) => {
    try {
        const { blood_group, units } = req.body;

        // Check if group exists, if yes update, if not insert
        const check = await pool.query(
            "SELECT * FROM blood_stock WHERE hospital_id = $1 AND blood_group = $2",
            [req.user.id, blood_group]
        );

        if (check.rows.length > 0) {
            await pool.query(
                "UPDATE blood_stock SET units = units + $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2",
                [units, check.rows[0].id]
            );
        } else {
            await pool.query(
                "INSERT INTO blood_stock (hospital_id, blood_group, units) VALUES ($1, $2, $3)",
                [req.user.id, blood_group, units]
            );
        }

        res.json({ message: "Stock updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error updating stock" });
    }
});

// ✅ Raise Hospital Blood Request
router.post('/request/create', verifyToken, isHospital, async (req, res) => {
    try {
        const { blood_group, units_required, contact_phone, city, hospital_name } = req.body;

        if (!/^\d{10}$/.test(contact_phone)) {
            return res.status(400).json({ message: "Contact number must be exactly 10 digits" });
        }

        // Check verification status and get hospital name for notifications
        const hospital = await pool.query("SELECT is_verified, name FROM users WHERE id = $1", [req.user.id]);
        if (!hospital.rows[0].is_verified) {
            return res.status(403).json({ message: "Hospital not verified by admin. Cannot raise requests." });
        }
        const exactHospitalName = hospital.rows[0].name;

        const newRequest = await pool.query(
            `INSERT INTO blood_requests 
            (user_id, hospital_id, blood_group, city, hospital, units_required, contact_phone, status, is_admin_verified)
            VALUES ($1, $1, $2, $3, $4, $5, $6, 'Pending', true)
            RETURNING *`,
            [req.user.id, blood_group, city, exactHospitalName, units_required, contact_phone]
        );

        // ✅ ⚡ SMART MATCHING: Notify Eligible Donors
        try {
            const matchingDonors = await pool.query(
                `SELECT id AS user_id FROM users 
                 WHERE role = 'user' 
                 AND LOWER(city) = LOWER($2)
                 AND id != $3
                 AND (
                     LOWER(blood_group) = LOWER($1)
                     OR LOWER(blood_group) = 'o-'
                     OR LOWER(blood_group) = 'o+'
                 )`,
                [blood_group, city, req.user.id]
            );

            if (matchingDonors.rows.length > 0) {
                const message = `🚨 Urgent: ${blood_group} Blood required at ${exactHospitalName} in ${city}.`;
                const notificationPromises = matchingDonors.rows.map(donor => {
                    return pool.query(
                        "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
                        [donor.user_id, message]
                    );
                });
                await Promise.all(notificationPromises);
            }
        } catch (matchError) {
            console.error("Smart Matching Error:", matchError);
            // Don't fail the request if notifications fail
        }

        res.status(201).json({
            message: "Blood request raised successfully, and matching donors notified! 🩸",
            request: newRequest.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error creating hospital request" });
    }
});

module.exports = router;
