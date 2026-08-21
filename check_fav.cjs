const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dngzzlvxndtfuxqfphgh.supabase.co', 'sb_publishable_mTMP95EpmF2LneQYVREH7A_bP4btUYj');

async function check() {
  const { data, error } = await supabase.from('favorite_salons').select('*').limit(1);
  console.log("Fav data:", data);
  console.log("Fav error:", error);
}
check();
