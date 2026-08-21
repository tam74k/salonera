const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dngzzlvxndtfuxqfphgh.supabase.co', 'sb_publishable_mTMP95EpmF2LneQYVREH7A_bP4btUYj');

async function run() {
  const { data, error } = await supabase.from('bookings').select('*').limit(1);
  console.log("Select error:", error);
}
run();
