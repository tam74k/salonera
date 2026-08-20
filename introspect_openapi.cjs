require('dotenv').config();
const fetch = require('node-fetch');

async function check() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(url);
  const json = await res.json();
  console.log(Object.keys(json.definitions || {}));
}
check();
