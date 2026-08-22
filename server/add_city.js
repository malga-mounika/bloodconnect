const pool = require('./db');
async function run() {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)');
        await pool.query("UPDATE users SET city = 'hyderabad' WHERE city IS NULL");
        console.log('City column added and populated');
    } catch (e) { console.error(e); }
    finally { process.exit(); }
}
run();
