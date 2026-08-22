const pool = require('./db');
const fs = require('fs');
async function run() {
    try {
        const users = await pool.query("SELECT * FROM users WHERE email='pravalika@gmail.com'");
        const reqs = await pool.query("SELECT * FROM blood_requests ORDER BY id DESC LIMIT 5");
        const notifs = await pool.query("SELECT * FROM notifications ORDER BY id DESC LIMIT 5");
        fs.writeFileSync('pravalika_check.json', JSON.stringify({
            user: users.rows[0],
            reqs: reqs.rows,
            notifs: notifs.rows
        }, null, 2));
    } catch (e) { console.error(e); }
    finally { process.exit(); }
}
run();
