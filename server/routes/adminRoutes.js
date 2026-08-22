const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();


// 👑 ADMIN DASHBOARD SUMMARY
router.get('/admin/dashboard', verifyToken, isAdmin, async (req, res) => {
    try {

        const totalUsers = await pool.query(
            "SELECT COUNT(*) FROM users WHERE role = 'user'"
        );

        const totalHospitals = await pool.query(
            "SELECT COUNT(*) FROM users WHERE role = 'hospital'"
        );

        const totalDonors = await pool.query(
            "SELECT COUNT(*) FROM donors"
        );

        const totalRequests = await pool.query(
            "SELECT COUNT(*) FROM blood_requests"
        );

        const pendingRequests = await pool.query(
            "SELECT COUNT(*) FROM blood_requests WHERE status = 'Pending'"
        );

        const fulfilledRequests = await pool.query(
            "SELECT COUNT(*) FROM blood_requests WHERE status = 'Fulfilled'"
        );

        res.json({
            dashboard: {
                total_users: parseInt(totalUsers.rows[0].count),
                total_hospitals: parseInt(totalHospitals.rows[0].count),
                total_donors: parseInt(totalDonors.rows[0].count),
                total_requests: parseInt(totalRequests.rows[0].count),
                pending_requests: parseInt(pendingRequests.rows[0].count),
                fulfilled_requests: parseInt(fulfilledRequests.rows[0].count)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// 👑 VIEW ALL USERS
router.get('/admin/users', verifyToken, isAdmin, async (req, res) => {
    try {

        const users = await pool.query(
            "SELECT id, name, email, role, is_verified, hospital_registration_number FROM users ORDER BY id DESC"
        );

        res.json({
            count: users.rows.length,
            users: users.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// 🗑️ DELETE USER (Admin only)
router.delete('/admin/users/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: "You cannot delete your own admin account." });
        }

        const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        res.json({ message: `User '${user.rows[0].name}' deleted successfully.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error deleting user." });
    }
});


// 👑 VIEW ALL REQUESTS
router.get('/admin/requests', verifyToken, isAdmin, async (req, res) => {
    try {

        const requests = await pool.query(
            "SELECT * FROM blood_requests ORDER BY created_at DESC"
        );

        res.json({
            count: requests.rows.length,
            requests: requests.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 👑 VERIFY HOSPITAL
router.post('/admin/hospitals/verify/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // true or false

        await pool.query(
            "UPDATE users SET is_verified = $1 WHERE id = $2 AND role = 'hospital'",
            [status, id]
        );

        res.json({ message: `Hospital ${status ? 'verified' : 'unverified'} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// 👑 VERIFY BLOOD REQUEST
router.post('/admin/requests/verify/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // true or false

        await pool.query(
            "UPDATE blood_requests SET is_admin_verified = $1 WHERE id = $2",
            [status, id]
        );

        res.json({ message: `Request ${status ? 'approved' : 'rejected'} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 👑 VIEW ALL DONORS
router.get('/admin/donors', verifyToken, isAdmin, async (req, res) => {
    try {
        const donors = await pool.query(`
            SELECT d.id, d.blood_group, d.city, d.phone, u.name, u.email
            FROM donors d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.id DESC
        `);

        res.json({
            count: donors.rows.length,
            donors: donors.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;