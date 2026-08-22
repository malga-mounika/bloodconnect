const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Get My Notifications
router.get('/my', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json({ notifications: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error fetching notifications" });
    }
});

// ✅ Mark Notification as Read
router.put('/read/:id', verifyToken, async (req, res) => {
    try {
        await pool.query(
            "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
            [req.params.id, req.user.id]
        );
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error updating notification" });
    }
});

module.exports = router;
