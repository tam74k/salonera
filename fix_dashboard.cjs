const fs = require('fs');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Residuals
    content = content.replace(/hover:text-zinc-700/g, 'hover:text-stone-300');
    content = content.replace(/focus:ring-zinc-900/g, 'focus:ring-amber-500');
    content = content.replace(/text-zinc-500/g, 'text-stone-400');
    content = content.replace(/text-zinc-900/g, 'text-stone-50');
    
    // Ensure correct backgrounds
    content = content.replace(/bg-stone-900\/40 border-stone-800/g, 'bg-stone-950 border-stone-800 text-stone-100'); // Inputs
    
    fs.writeFileSync(filePath, content);
}

fix('src/screens/Dashboards.tsx');
console.log('Dashboards fixed');
