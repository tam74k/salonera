const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(/import \{ CheckCircle2/, "import { CheckCircle2, ImageIcon");

fs.writeFileSync('src/screens/Dashboards.tsx', content);
