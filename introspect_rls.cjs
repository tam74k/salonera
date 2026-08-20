require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('salons').insert({
    name_en: "Test",
    name_ar: "Test"
  });
  console.log("Insert salon:", error || "Success");
}
check();
