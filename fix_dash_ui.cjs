const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(/bg-slate-50/g, "bg-zinc-50");
content = content.replace(/border-slate-200/g, "border-zinc-200");
content = content.replace(/border-slate-100/g, "border-zinc-100");
content = content.replace(/text-slate-700/g, "text-zinc-700");
content = content.replace(/text-slate-500/g, "text-zinc-500");
content = content.replace(/text-slate-900/g, "text-zinc-900");
content = content.replace(/text-slate-400/g, "text-zinc-400");
content = content.replace(/text-slate-600/g, "text-zinc-600");
content = content.replace(/bg-slate-900/g, "bg-zinc-900");

// Convert indigo to zinc for primary UI elements
content = content.replace(/bg-indigo-600/g, "bg-zinc-900");
content = content.replace(/hover:bg-indigo-700/g, "hover:bg-zinc-800");
content = content.replace(/text-indigo-600/g, "text-zinc-900");
content = content.replace(/bg-indigo-50/g, "bg-zinc-100");
content = content.replace(/border-indigo-600/g, "border-zinc-900");
content = content.replace(/border-indigo-100/g, "border-zinc-200");
content = content.replace(/from-indigo-900/g, "from-zinc-900");
content = content.replace(/to-indigo-800/g, "to-zinc-800");
content = content.replace(/shadow-indigo-900\/20/g, "shadow-zinc-900\/20");
content = content.replace(/text-indigo-200/g, "text-zinc-300");
content = content.replace(/text-indigo-700/g, "text-zinc-900");
content = content.replace(/text-indigo-500/g, "text-zinc-500");

// Reduce excessive rounded corners for a sharper professional look
content = content.replace(/rounded-3xl/g, "rounded-[24px]");
content = content.replace(/rounded-2xl/g, "rounded-[16px]");

fs.writeFileSync('src/screens/Dashboards.tsx', content);
