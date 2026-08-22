const pool = require('./db');

async function applyMigration() {
    try {
        console.log("🚀 Creating otp_verifications table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS otp_verifications (
                phone_number VARCHAR(15) PRIMARY KEY,
                otp VARCHAR(6) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ otp_verifications table created successfully.");

        console.log("🎊 Migration applied successfully!");
    } catch (err) {
        console.error("❌ Migration Error:", err);
    } finally {
        process.exit();
    }
}

applyMigration();
