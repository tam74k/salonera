const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

console.log(content.match(/setHeaderTitle/g));
