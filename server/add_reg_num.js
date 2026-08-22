const pool = require('./db');
async function run() {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS hospital_registration_number VARCHAR(100)');
        console.log('Added hospital_registration_number column');
    } catch (e) { console.error(e); }
    finally { process.exit(); }
}
run();
