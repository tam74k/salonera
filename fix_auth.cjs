const fs = require('fs');
let content = fs.readFileSync('src/screens/Auth.tsx', 'utf8');

content = content.replace(/focus:ring-zinc-900 focus:border-zinc-900/g, 'focus:ring-amber-500 focus:border-amber-500 text-stone-100');
content = content.replace(/focus:ring-zinc-900/g, 'focus:ring-amber-500');
content = content.replace(/bg-stone-950 hover:bg-stone-800 text-white/g, 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold border-none');
content = content.replace(/text-stone-950 hover:bg-stone-800 text-white/g, 'bg-amber-500 hover:bg-amber-400 text-stone-950');
content = content.replace(/hover:text-zinc-900/g, 'hover:text-stone-200');
content = content.replace(/text-zinc-900/g, 'text-stone-50');

// Fix app root backgrounds if they are still light
content = content.replace(/min-h-\[80vh\] flex items-center justify-center p-4/g, 'min-h-[80vh] flex items-center justify-center p-4 text-stone-200');
content = content.replace(/bg-white rounded-\[32px\] shadow-xl border border-stone-800\/50/g, 'bg-stone-900 rounded-[32px] shadow-2xl border border-stone-800');

fs.writeFileSync('src/screens/Auth.tsx', content);
console.log('Auth fixed');
