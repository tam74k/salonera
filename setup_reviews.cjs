const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dngzzlvxndtfuxqfphgh.supabase.co', 'sb_publishable_mTMP95EpmF2LneQYVREH7A_bP4btUYj');

async function check() {
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  console.log("Reviews exists:", !error);
}
check();
