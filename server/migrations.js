const pool = require('./db');

async function runMigrations() {
    try {
        console.log("🚀 Starting Database Migrations...");

        // 1. Update Users Table
        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS dob DATE,
      ADD COLUMN IF NOT EXISTS health_info TEXT,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
    `);
        console.log("✅ Users table updated (dob, health_info, is_verified)");

        // 2. Create Blood Stock Table (for Hospitals)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS blood_stock (
        id SERIAL PRIMARY KEY,
        hospital_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        blood_group VARCHAR(5) NOT NULL,
        units INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Blood Stock table created");

        // 3. Update Blood Requests Table
        await pool.query(`
      ALTER TABLE blood_requests 
      ADD COLUMN IF NOT EXISTS hospital_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS donor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS is_admin_verified BOOLEAN DEFAULT false;
    `);
        console.log("✅ Blood Requests table updated (hospital_id, donor_id, is_admin_verified)");

        // 4. Create Donation History Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS donation_history (
        id SERIAL PRIMARY KEY,
        donor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        request_id INTEGER REFERENCES blood_requests(id) ON DELETE CASCADE,
        hospital_id INTEGER REFERENCES users(id),
        donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'Completed'
      );
    `);
        console.log("✅ Donation History table created");

        console.log("🎊 All migrations completed successfully!");
    } catch (err) {
        console.error("❌ Migration Error:", err);
    } finally {
        process.exit();
    }
}

runMigrations();
