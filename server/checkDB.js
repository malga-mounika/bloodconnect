const pool = require('./db');

async function checkTable() {
    try {
        const res = await pool.query("SELECT to_regclass('public.users') AS exists;");
        console.log("Users Table Presence:", res.rows[0].exists);
        if (!res.rows[0].exists) {
            console.log("Users table does not exist. Please create it.");
            // Create table logic if needed
            const createQuery = `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'user'
          );
        `;
            await pool.query(createQuery);
            console.log("✅ Users table created!");
        }
    } catch (err) {
        console.error("Error during table check:", err);
    } finally {
        process.exit();
    }
}

checkTable();
