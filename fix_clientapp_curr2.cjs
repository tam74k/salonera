const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const oldStr = `  const totalPrice = selectedServices.reduce((sum, id) => {
    const s = services.find(srv => srv.id === id);
    return sum + (s?.price || 0);
  }, 0);`;

const newStr = `  const totalPrice = selectedServices.reduce((sum, id) => {
    const s = services.find(srv => srv.id === id);
    return sum + (s?.price || 0);
  }, 0);

  const currSymbol = selectedSalon?.country ? (isAr ? selectedSalon.country.currency_ar : selectedSalon.country.currency_en) : (isAr ? 'ر.س' : 'SAR');`;

content = content.replace(oldStr, newStr);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("ClientApp updated with currSymbol definition");
