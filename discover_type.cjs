require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const types = ['both', 'men', 'women', 'unisex', 'male', 'female', 'M', 'F'];
  for (let t of types) {
    const { data, error } = await supabase.from('salons').insert({
      owner_id: '00000000-0000-0000-0000-000000000000',
      name_ar: 'T', name_en: 'T', country: 'SA', currency: 'SAR', type: t
    });
    console.log(t, error?.message || 'Success');
  }
}
check();
