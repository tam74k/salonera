const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('create_artist_user', {
    p_email: 'test_artist_' + Date.now() + '@test.com',
    p_password: 'test',
    p_first_name_ar: 'test',
    p_first_name_en: 'test',
    p_mobile: '123',
    p_salon_id: '00000000-0000-0000-0000-000000000000',
    p_avatar_url: ''
  });
  console.log(error || data);
}
run();
