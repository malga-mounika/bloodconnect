const pool = require('./db');
const fs = require('fs');

async function run() {
    try {
        const notifs = await pool.query("SELECT * FROM notifications ORDER BY id DESC LIMIT 5");
        const matches = await pool.query(`SELECT id AS user_id, name, blood_group, city FROM users 
                 WHERE role = 'user' AND LOWER(blood_group) = LOWER('A+') AND LOWER(city) = LOWER('hyderabad')`);

        fs.writeFileSync('notifs_dump.json', JSON.stringify({
            notifs: notifs.rows,
            matches: matches.rows
        }, null, 2));

    } catch (e) { console.error(e); }
    finally { process.exit(); }
}
run();
