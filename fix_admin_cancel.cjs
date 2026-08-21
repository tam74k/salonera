const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(/status === 'cancelled'/g, "status === 'canceled'");
content = content.replace(/value="cancelled"/g, 'value="canceled"');

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Success Dashboard cancelled -> canceled");
