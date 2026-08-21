const fs = require('fs');

function applyTheme(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Backgrounds
    content = content.replace(/bg-\[#FAFAFA\]/g, 'bg-stone-950');
    content = content.replace(/bg-white\/80/g, 'bg-stone-950/80');
    content = content.replace(/bg-white\/90/g, 'bg-stone-950/90');
    content = content.replace(/bg-white/g, 'bg-stone-900');
    
    // Avoid replacing bg-white where it's part of another string, but for Tailwind bg-white is a full class.
    // A safer replace for exact classes:
    const classMap = {
        'bg-white': 'bg-stone-900',
        'bg-zinc-50': 'bg-stone-900/40',
        'bg-zinc-100': 'bg-stone-800/50',
        'bg-zinc-200': 'bg-stone-800',
        'bg-zinc-900': 'bg-stone-950',
        'bg-slate-50': 'bg-stone-900/40',
        'bg-slate-100': 'bg-stone-800/50',
        'bg-slate-200': 'bg-stone-800',
        
        'text-zinc-900': 'text-stone-50',
        'text-zinc-800': 'text-stone-200',
        'text-zinc-700': 'text-stone-300',
        'text-zinc-600': 'text-stone-400',
        'text-zinc-500': 'text-stone-400',
        'text-zinc-400': 'text-stone-500',
        
        'text-slate-900': 'text-stone-50',
        'text-slate-800': 'text-stone-200',
        'text-slate-700': 'text-stone-300',
        'text-slate-500': 'text-stone-400',
        'text-slate-400': 'text-stone-500',
        
        'border-zinc-100': 'border-stone-800/50',
        'border-zinc-200': 'border-stone-800',
        'border-zinc-300': 'border-stone-700',
        'border-slate-100': 'border-stone-800/50',
        'border-slate-200': 'border-stone-800',
        
        'hover:bg-zinc-100': 'hover:bg-stone-800',
        'hover:bg-zinc-200': 'hover:bg-stone-700',
        'hover:bg-zinc-800': 'hover:bg-stone-800',
        'hover:bg-slate-100': 'hover:bg-stone-800',
        'hover:bg-slate-200': 'hover:bg-stone-700',
        'hover:bg-slate-800': 'hover:bg-stone-800',
        
        // Buttons that were dark zinc-900
        'bg-zinc-900 hover:bg-slate-800': 'bg-amber-500 text-stone-950 hover:bg-amber-400',
        'bg-zinc-900 hover:bg-zinc-800': 'bg-amber-500 text-stone-950 hover:bg-amber-400',
        'bg-zinc-900 text-white': 'bg-amber-500 text-stone-950',
        
        'shadow-sm': 'shadow-md shadow-black/20',
        
        // Amber overrides for stars and specific highlights
        // Heart previously used rose-500, keep it or change it? Let's keep hearts rose.
    };
    
    // We can do a smart split and replace, or regex for whole words
    for (const [oldClass, newClass] of Object.entries(classMap)) {
        const regex = new RegExp(`(?<=\\s|["'\`])` + oldClass.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + `(?=\\s|["'\`])`, 'g');
        content = content.replace(regex, newClass);
    }

    fs.writeFileSync(filePath, content);
}

applyTheme('src/App.tsx');
applyTheme('src/screens/ClientApp.tsx');
applyTheme('src/screens/Dashboards.tsx');
applyTheme('src/screens/Auth.tsx');
console.log('Theme applied successfully!');
