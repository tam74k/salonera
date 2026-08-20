const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(
  "discount_price: parseFloat(srvDiscountPrice),",
  "discount_price: srvDiscountPrice ? parseFloat(srvDiscountPrice) : null,"
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
