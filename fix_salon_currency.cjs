const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(
  /type: 'both',\n             country: 'SA'/,
  "type: 'both',\n             country: 'SA',\n             currency: 'SAR'"
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Fixed currency in Dashboards.tsx");
