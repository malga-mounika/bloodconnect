const pool = require('./db');

async function applyMigration() {
    try {
        console.log("🚀 Applying OTP and Unique Phone Migrations...");

        // 1. Add UNIQUE constraint to phone_number
        // We first check if there are any duplicates. If there are, this might fail.
        // But we'll try to add it.
        await pool.query(`
            ALTER TABLE users 
            ADD CONSTRAINT unique_phone_number UNIQUE (phone_number);
        `);
        console.log("✅ Unique constraint added to phone_number");


        // 3. Ensure is_verified exists (it should from previous migrations, but safe to check)
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
        `);
        console.log("✅ is_verified column ensured");

        console.log("🎊 Migration applied successfully!");
    } catch (err) {
        if (err.code === '23505') {
            console.error("❌ Migration Failed: Duplicate phone numbers found in the database. Please clean up data before applying unique constraint.");
        } else if (err.code === '42710') {
              console.log("ℹ️ Unique constraint already exists.");
        } else {
            console.error("❌ Migration Error:", err);
        }
    } finally {
        process.exit();
    }
}

applyMigration();
