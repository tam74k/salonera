const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dngzzlvxndtfuxqfphgh.supabase.co', 'sb_publishable_mTMP95EpmF2LneQYVREH7A_bP4btUYj');

async function check() {
  const { data: salons, error: err1 } = await supabase.from('salons').select('images, address_ar, address_en, lat, lng').limit(1);
  console.log("Salons images column:", salons && salons[0] ? salons[0].images : 'no data');
  const { data: salonImages, error: err2 } = await supabase.from('salon_images').select('*').limit(1);
  console.log("salon_images table exists:", !err2);
}
check();
