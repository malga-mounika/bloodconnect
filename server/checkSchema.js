const pool = require('./db');

async function checkSchema() {
    try {
        const tables = ['users', 'donors', 'blood_requests', 'blood_stock', 'donation_history'];
        for (const table of tables) {
            console.log(`\n--- Checking Table: ${table} ---`);
            const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1;
      `, [table]);

            if (res.rows.length === 0) {
                console.log(`❌ Table ${table} DOES NOT EXIST.`);
            } else {
                res.rows.forEach(row => {
                    console.log(`- ${row.column_name} (${row.data_type})`);
                });
            }
        }
    } catch (err) {
        console.error("Error checking schema:", err);
    } finally {
        process.exit();
    }
}

checkSchema();
