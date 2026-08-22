const pool = require('./db');
async function run() {
    try {
        const users = await pool.query("SELECT * FROM users WHERE email='user1@gmail.com'");
        console.log('User:', JSON.stringify(users.rows[0]));
        const reqs = await pool.query("SELECT * FROM blood_requests ORDER BY id DESC LIMIT 5");
        console.log('Requests:', JSON.stringify(reqs.rows, null, 2));
        const notifs = await pool.query("SELECT * FROM notifications ORDER BY id DESC LIMIT 5");
        console.log('Notifs:', JSON.stringify(notifs.rows, null, 2));
    } catch (e) { console.error(e); }
    finally { process.exit(); }
}
run();
