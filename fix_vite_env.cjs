const fs = require('fs');
let content = fs.readFileSync('src/lib/supabase.ts', 'utf8');

// The issue "Property 'env' does not exist on type 'ImportMeta'" happens when Vite types are missing.
// A quick fix is to add a reference to vite/client at the top.
const typesHeader = `/// <reference types="vite/client" />\n`;
if (!content.includes('vite/client')) {
    content = typesHeader + content;
    fs.writeFileSync('src/lib/supabase.ts', content);
}
