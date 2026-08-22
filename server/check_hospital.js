const pool = require('./db');
async function run() {
    try {
        const users = await pool.query("SELECT id, name, email, role FROM users WHERE role = 'hospital' OR email LIKE '%flortis%'");
        console.log('Hospitals:', JSON.stringify(users.rows, null, 2));
    } catch (e) { console.error(e); }
    finally { process.exit(); }
}
run();
