require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  console.log("Attempting insert...");
  const { data, error } = await supabase.from('salons').insert({
    name_ar: 'Test',
    name_en: 'Test',
    type: 'both',
    country: 'SA',
    currency: 'SAR',
    owner_id: '00000000-0000-0000-0000-000000000000'
  });
  console.log("Error details:", JSON.stringify(error, null, 2));
}
check();
