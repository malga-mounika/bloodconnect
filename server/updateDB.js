const pool = require('./db');

async function updateDB() {
    try {
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5);");
        console.log("✅ Added blood_group to users table!");
    } catch (err) {
        console.error("Error updating DB:", err);
    } finally {
        process.exit();
    }
}

updateDB();
