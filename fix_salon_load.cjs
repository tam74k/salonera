const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(
  "images: salon.images || [],",
  "images: salon.images || [],\n          salon_type: salon.type || 'both',"
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
