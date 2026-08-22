const pool = require('./db');
async function run() {
    try {
        const users = await pool.query("SELECT id, name, email, role, blood_group, city FROM users WHERE role = 'user'");
        const notifs = await pool.query("SELECT * FROM notifications");
        require('fs').writeFileSync('db_out.json', JSON.stringify({ users: users.rows, notifs: notifs.rows }, null, 2));
    } catch (e) { console.error(e); }
    finally { process.exit(); }
}
run();
