const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// Update fetch
content = content.replace(
  "const { data } = await supabase.from('salons').select('*');",
  "const { data } = await supabase.from('salons').select('*, country:countries(currency_ar, currency_en)');"
);

// Define currSymbol
const helperStr = `  const totalPrice = selectedServices.reduce((sum, sId) => {
    const s = salonServices.find(srv => srv.id === sId);
    return sum + (s?.discount_price || s?.original_price || 0);
  }, 0);

  const currSymbol = selectedSalon?.country ? (isAr ? selectedSalon.country.currency_ar : selectedSalon.country.currency_en) : (isAr ? 'ر.س' : 'SAR');
`;
content = content.replace(/  const totalPrice = selectedServices.reduce\(\(sum, sId\) => {[\s\S]*?\}, 0\);/, helperStr);

// Replace SAR in ClientApp
content = content.replace(/SAR {totalPrice}/g, "{currSymbol} {totalPrice}");
content = content.replace(/SAR {service\.original_price}/g, "{currSymbol} {service.original_price}");
content = content.replace(/SAR {service\.discount_price}/g, "{currSymbol} {service.discount_price}");

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("ClientApp updated with dynamic currency");
