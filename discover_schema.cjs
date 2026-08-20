require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function discover() {
  let payload = {
    owner_id: '00000000-0000-0000-0000-000000000000',
    name_ar: 'Test',
    name_en: 'Test',
    type: 'both',
    country: 'SA',
    currency: 'SAR'
  };
  
  for (let i = 0; i < 10; i++) {
    const { data, error } = await supabase.from('salons').insert(payload);
    if (error) {
      if (error.message.includes('not-null constraint') || error.message.includes('violates not-null')) {
        const match = error.message.match(/column "([^"]+)"/);
        if (match) {
          console.log("Missing column:", match[1]);
          payload[match[1]] = 'dummy'; // Give it a string, if it fails type, we'll see
          continue;
        }
      }
      console.log("Final Error:", error.message);
      break;
    } else {
      console.log("Success?");
      break;
    }
  }
  console.log("Final payload:", payload);
}
discover();
