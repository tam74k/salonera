require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function runSQL() {
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT pg_get_constraintdef(c.oid) AS constraint_def
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'salons' AND c.contype = 'c';
    `);
    console.log(res.rows);
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

runSQL();
