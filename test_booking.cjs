const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.example', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: user, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'tam74k@gmail.com', // user email
    password: 'password123' // assuming they have a password, or maybe I can't do this easily
  });
  console.log(user, authErr);
}
run();
