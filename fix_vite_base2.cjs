const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');
content = content.replace(/base: '\.\/',/, "base: '/salonera/',");
fs.writeFileSync('vite.config.ts', content);
