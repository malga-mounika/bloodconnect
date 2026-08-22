const pool = require('./db');
async function run() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications'");
        console.log(JSON.stringify(res.rows.map(r => r.column_name)));
    } catch (e) { console.error(e); }
    finally { process.exit(); }
}
run();
