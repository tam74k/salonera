const fs = require('fs');
let content = fs.readFileSync('src/screens/Auth.tsx', 'utf8');

content = content.replace(/bg-slate-50/g, "bg-zinc-50");
content = content.replace(/border-slate-200/g, "border-zinc-200");
content = content.replace(/border-slate-100/g, "border-zinc-100");
content = content.replace(/text-slate-700/g, "text-zinc-700");
content = content.replace(/text-slate-500/g, "text-zinc-500");
content = content.replace(/text-slate-900/g, "text-zinc-900");
content = content.replace(/text-slate-400/g, "text-zinc-400");
content = content.replace(/text-slate-600/g, "text-zinc-600");
content = content.replace(/bg-slate-900 hover:bg-slate-800/g, "bg-zinc-900 hover:bg-zinc-800");

// Fix focus rings
content = content.replace(/focus:ring-indigo-500/g, "focus:ring-zinc-900 focus:border-zinc-900");
content = content.replace(/text-indigo-600/g, "text-zinc-900");
content = content.replace(/text-indigo-700/g, "text-zinc-900");
content = content.replace(/bg-indigo-600/g, "bg-zinc-900");
content = content.replace(/bg-indigo-50/g, "bg-zinc-50");

// Remove the blurred blobs for a cleaner look
content = content.replace(/<div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-zinc-50 rounded-full blur-3xl"><\/div>/, "");
content = content.replace(/<div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-zinc-50\/50 rounded-full blur-3xl"><\/div>/, "");
content = content.replace(/shadow-2xl shadow-indigo-900\/5/g, "shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100");
content = content.replace(/rounded-\[2rem\]/g, "rounded-[24px]");

if(!content.includes("Scissors")) {
  content = content.replace("AlertCircle, Loader2 }", "AlertCircle, Loader2, Scissors }");
}

fs.writeFileSync('src/screens/Auth.tsx', content);
