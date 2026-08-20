const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

content = content.replace(
  "price: s?.price || 0",
  "price: s?.discount_price || s?.original_price || 0"
);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
