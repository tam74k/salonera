require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function check() {
  await client.connect();
  const res = await client.query(`
    SELECT event_object_table, trigger_name, action_statement
    FROM information_schema.triggers
    WHERE event_object_table IN ('users', 'profiles', 'salons');
  `);
  console.log(res.rows);
  await client.end();
}
check().catch(console.error);
