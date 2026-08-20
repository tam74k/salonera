const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('app_settings').update({
    evolution_api_url: 'https://evo.101488.xyz',
    evolution_instance: 'TamerMostafa',
    evolution_api_key: '78518239685A-4904-A7C3-827767FA2EEE'
  }).eq('id', 'global');
  
  if (error) console.error("Error updating settings:", error);
  else console.log("Global settings updated successfully.");
}

run();
