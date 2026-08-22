const pool = require('./db');

async function verify() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log("--- Users Table Schema ---");
        res.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

        const constraints = await pool.query(`
            SELECT conname, contype 
            FROM pg_constraint 
            WHERE conrelid = 'users'::regclass;
        `);
        console.log("\n--- Users Table Constraints ---");
        constraints.rows.forEach(row => {
            console.log(`- ${row.conname} (type: ${row.contype})`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
verify();
