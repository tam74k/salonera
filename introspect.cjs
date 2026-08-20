require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('services').select('*').limit(1);
  console.log("Services columns:", data && data.length ? Object.keys(data[0]) : (error ? error : "No data, but table exists"));
  
  // Try inserting a dummy service to see the error
  const { error: insErr } = await supabase.from('services').insert({
    salon_id: '00000000-0000-0000-0000-000000000000', // invalid uuid, but if column missing it might complain about column first
    name_ar: 'test',
    original_price: 50,
    duration_minutes: 30
  });
  console.log("Insert test error:", insErr);
}
check();
