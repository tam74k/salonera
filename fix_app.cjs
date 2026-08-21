const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Global Header: bg-stone-950/80 border-slate-200 -> bg-stone-950/80 border-stone-800
content = content.replace(/border-slate-200/g, 'border-stone-800');
content = content.replace(/bg-stone-950\/80 backdrop-blur-md/g, 'bg-stone-950/80 backdrop-blur-md border-b border-stone-800/50');
content = content.replace(/text-slate-900/g, 'text-stone-50');
content = content.replace(/text-slate-700/g, 'text-stone-300');
content = content.replace(/bg-slate-100/g, 'bg-stone-900');
content = content.replace(/hover:bg-slate-200/g, 'hover:bg-stone-800');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx fixed');
