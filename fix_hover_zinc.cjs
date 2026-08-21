const fs = require('fs');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace remaining light hover classes
    content = content.replace(/hover:bg-zinc-50/g, 'hover:bg-stone-800');
    content = content.replace(/bg-zinc-50/g, 'bg-stone-800/50');
    content = content.replace(/bg-zinc-100/g, 'bg-stone-800');
    content = content.replace(/bg-slate-100/g, 'bg-stone-800');
    content = content.replace(/bg-slate-50\/50/g, 'bg-stone-900/50');
    content = content.replace(/border-zinc-200/g, 'border-stone-800');
    content = content.replace(/text-slate-800/g, 'text-stone-200');
    content = content.replace(/text-zinc-400/g, 'text-stone-500');
    content = content.replace(/text-zinc-600/g, 'text-stone-400');
    content = content.replace(/text-zinc-800/g, 'text-stone-200');
    
    fs.writeFileSync(filePath, content);
}

fix('src/screens/ClientApp.tsx');
fix('src/screens/Dashboards.tsx');
console.log('Hover zinc fixed');
