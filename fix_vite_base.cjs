const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

if (!content.includes('base:')) {
    content = content.replace(/plugins:/, "base: './',\n    plugins:");
    fs.writeFileSync('vite.config.ts', content);
}
