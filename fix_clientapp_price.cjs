const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const oldStr = `  const totalPrice = selectedServices.reduce((sum, id) => {
    const s = services.find(srv => srv.id === id);
    return sum + (s?.price || 0);
  }, 0);`;

const newStr = `  const totalPrice = selectedServices.reduce((sum, id) => {
    const s = services.find(srv => srv.id === id);
    return sum + (s?.discount_price || s?.original_price || 0);
  }, 0);`;

content = content.replace(oldStr, newStr);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("ClientApp price calc fixed");
