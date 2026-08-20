const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(
  /type: 'both'/,
  "type: 'both',\n             country: 'SA'"
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Fixed country in Dashboards.tsx");
