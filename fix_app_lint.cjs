const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/<AuthFlow key="auth" onLogin=/g, '<AuthFlow onLogin=');

fs.writeFileSync('src/App.tsx', content);
