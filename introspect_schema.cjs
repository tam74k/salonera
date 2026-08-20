require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function runSQL() {
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT column_name, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'salons';
    `);
    console.table(res.rows);
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

runSQL();
