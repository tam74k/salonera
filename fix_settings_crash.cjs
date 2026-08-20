const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// Fix 1: Optional chaining on toString()
content = content.replace(/g\.country_id\.toString\(\) === salonCountry\.toString\(\)/g, "g.country_id?.toString() === salonCountry?.toString()");
content = content.replace(/ci\.governorate_id\.toString\(\) === salonGov\.toString\(\)/g, "ci.governorate_id?.toString() === salonGov?.toString()");
content = content.replace(/salonCountry\.toString\(\)/g, "salonCountry?.toString()");
content = content.replace(/salonGov\.toString\(\)/g, "salonGov?.toString()");
content = content.replace(/salonCity\.toString\(\)/g, "salonCity?.toString()");

fs.writeFileSync('src/screens/Dashboards.tsx', content);
