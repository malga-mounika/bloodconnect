const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();


// 🩸 Register as Donor (User Role Only)
router.post('/donor/register', verifyToken, async (req, res) => {
    try {

        if (req.user.role !== 'user') {
            return res.status(403).json({
                message: "Only normal users can register as donors"
            });
        }

        const { blood_group, city, phone } = req.body;

        if (!blood_group || !city || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingDonor = await pool.query(
            "SELECT * FROM donors WHERE user_id = $1",
            [req.user.id]
        );

        if (existingDonor.rows.length > 0) {
            return res.status(400).json({
                message: "You are already registered as a donor"
            });
        }

        const newDonor = await pool.query(
            `INSERT INTO donors (user_id, blood_group, city, phone)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.id, blood_group, city, phone]
        );

        res.status(201).json({
            message: "Donor registered successfully",
            donor: newDonor.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// 🔎 Search Donors (Public + Case-Insensitive)
router.get('/donor/search', async (req, res) => {
    try {
        const { blood_group, city } = req.query;

        let query = 'SELECT * FROM donors WHERE 1=1';
        const values = [];

        if (blood_group) {
            values.push(blood_group.toLowerCase());
            query += ` AND LOWER(blood_group) = $${values.length}`;
        }

        if (city) {
            values.push(city.toLowerCase());
            query += ` AND LOWER(city) = $${values.length}`;
        }

        const result = await pool.query(query, values);

        res.json({
            count: result.rows.length,
            donors: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// 🔄 Update Donor Details (User Role Only)
router.put('/donor/update', verifyToken, async (req, res) => {
    try {

        if (req.user.role !== 'user') {
            return res.status(403).json({
                message: "Only normal users can update donor profile"
            });
        }

        const { blood_group, city, phone } = req.body;

        if (!blood_group || !city || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingDonor = await pool.query(
            "SELECT * FROM donors WHERE user_id = $1",
            [req.user.id]
        );

        if (existingDonor.rows.length === 0) {
            return res.status(404).json({ message: "Donor not found" });
        }

        const updatedDonor = await pool.query(
            `UPDATE donors
             SET blood_group = $1,
                 city = $2,
                 phone = $3
             WHERE user_id = $4
             RETURNING *`,
            [blood_group, city, phone, req.user.id]
        );

        res.json({
            message: "Donor updated successfully",
            donor: updatedDonor.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// ❌ Delete Own Donor Profile (User)
router.delete('/donor/delete', verifyToken, async (req, res) => {
    try {

        if (req.user.role !== 'user') {
            return res.status(403).json({
                message: "Only normal users can delete their donor profile"
            });
        }

        const existingDonor = await pool.query(
            "SELECT * FROM donors WHERE user_id = $1",
            [req.user.id]
        );

        if (existingDonor.rows.length === 0) {
            return res.status(404).json({ message: "Donor not found" });
        }

        await pool.query(
            "DELETE FROM donors WHERE user_id = $1",
            [req.user.id]
        );

        res.json({
            message: "Donor profile deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// 👑 Admin Delete Any Donor
router.delete('/admin/donor/:id', verifyToken, isAdmin, async (req, res) => {
    try {

        const { id } = req.params;

        const donorCheck = await pool.query(
            "SELECT * FROM donors WHERE id = $1",
            [id]
        );

        if (donorCheck.rows.length === 0) {
            return res.status(404).json({ message: "Donor not found" });
        }

        await pool.query(
            "DELETE FROM donors WHERE id = $1",
            [id]
        );

        res.json({
            message: "Donor deleted by admin successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;