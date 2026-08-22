const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();


// 🩸 Create Blood Request (Protected)
router.post('/request/create', verifyToken, async (req, res) => {
    try {
        const { blood_group, city, hospital, units_required, contact_phone } = req.body;

        if (!blood_group || !city || !hospital || !units_required || !contact_phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!/^\d{10}$/.test(contact_phone)) {
            return res.status(400).json({ message: "Contact number must be exactly 10 digits" });
        }

        const newRequest = await pool.query(
            `INSERT INTO blood_requests 
            (user_id, blood_group, city, hospital, units_required, contact_phone, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
            RETURNING *`,
            [req.user.id, blood_group, city, hospital, units_required, contact_phone]
        );

        // 🔔 SMART MATCHING LOGIC
        // Find matching donors + Universal donors (O- for everyone, O+ for positive types)
        const matchingDonors = await pool.query(
            `SELECT id FROM users 
             WHERE role = 'user' 
             AND LOWER(city) = LOWER($2)
             AND (
                 blood_group = $1 
                 OR blood_group = 'O-' 
                 OR blood_group = 'O+'
             )`,
            [blood_group, city]
        );

        if (matchingDonors.rows.length > 0) {
            const message = `🚨 Urgent: ${hospital} needs ${units_required} units of ${blood_group} blood in ${city}.`;

            // Insert a notification for each eligible donor
            for (let donor of matchingDonors.rows) {
                await pool.query(
                    "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
                    [donor.id, message]
                );
            }
        }

        res.status(201).json({
            message: "Blood request created successfully",
            request: newRequest.rows[0],
            notifiedDonors: matchingDonors.rows.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// 📋 View All Requests (Public)
router.get('/request/all', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM blood_requests ORDER BY created_at DESC"
        );

        res.json({
            count: result.rows.length,
            requests: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// 👤 View My Requests (Protected)
router.get('/request/my', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM blood_requests WHERE user_id = $1 ORDER BY created_at DESC",
            [req.user.id]
        );

        res.json({
            count: result.rows.length,
            requests: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// 🔄 Update Request Status (Protected - Owner Only)
router.put('/request/status/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const requestCheck = await pool.query(
            "SELECT * FROM blood_requests WHERE id = $1 AND user_id = $2",
            [id, req.user.id]
        );

        if (requestCheck.rows.length === 0) {
            return res.status(404).json({ message: "Request not found or unauthorized" });
        }

        const updatedRequest = await pool.query(
            `UPDATE blood_requests
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        // ✅ Also update donation_history if status is Fulfilled
        if (status === 'Fulfilled') {
            await pool.query(
                "UPDATE donation_history SET status = 'Fulfilled' WHERE request_id = $1",
                [id]
            );
        }

        res.json({
            message: "Request status updated successfully",
            request: updatedRequest.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// 🔎 Search Blood Requests (Filter by city, blood group, status)
router.get('/request/search', async (req, res) => {
    try {
        const { blood_group, city, status } = req.query;

        let query = 'SELECT * FROM blood_requests WHERE 1=1';
        const values = [];

        if (blood_group) {
            values.push(blood_group.toLowerCase());
            query += ` AND LOWER(blood_group) = $${values.length}`;
        }

        if (city) {
            values.push(city.toLowerCase());
            query += ` AND LOWER(city) = $${values.length}`;
        }

        if (status) {
            values.push(status);
            query += ` AND status = $${values.length}`;
        }

        query += " ORDER BY created_at DESC";

        const result = await pool.query(query, values);

        res.json({
            count: result.rows.length,
            requests: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Accept a Blood Request (Donor Only)
router.post('/request/accept/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find the request
        const requestRes = await pool.query("SELECT * FROM blood_requests WHERE id = $1", [id]);
        if (requestRes.rows.length === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        const request = requestRes.rows[0];

        if (request.user_id === req.user.id) {
            return res.status(400).json({ message: "You cannot accept your own request" });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: "Request is no longer pending (" + request.status + ")" });
        }

        // 2. Update the request status and set donor_id
        await pool.query(
            `UPDATE blood_requests 
             SET status = 'Accepted', donor_id = $1 
             WHERE id = $2`,
            [req.user.id, id]
        );

        // 3. Log into donation_history
        await pool.query(
            `INSERT INTO donation_history (donor_id, request_id, hospital_id, status)
             VALUES ($1, $2, $3, 'Accepted')`,
            [req.user.id, id, request.hospital_id]
        );

        res.json({ message: "Request accepted successfully! 🩸" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error accepting request" });
    }
});

// ✅ View My Donation History
router.get('/my-donations', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT dh.*, br.blood_group, br.city, br.hospital, br.contact_phone 
             FROM donation_history dh
             JOIN blood_requests br ON dh.request_id = br.id
             WHERE dh.donor_id = $1
             ORDER BY dh.donation_date DESC`,
            [req.user.id]
        );

        res.json({ donations: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error fetching donation history" });
    }
});


module.exports = router;