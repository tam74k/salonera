const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const bad = `            <div className="hidden md:flex items-center gap-3 mr-2 pr-4 border-r border-zinc-200 rtl:border-r-0 rtl:border-l rtl:pl-4 rtl:mr-0 rtl:ml-2">
              <div className={\`flex flex-col \${isAr ? 'text-left' : 'text-right'}\`}>`;

const good = `            <div className="flex items-center gap-3 mr-2 pr-4 border-r border-zinc-200 rtl:border-r-0 rtl:border-l rtl:pl-4 rtl:mr-0 rtl:ml-2">
              <div className={\`hidden md:flex flex-col \${isAr ? 'text-left' : 'text-right'}\`}>`;

content = content.replace(bad, good);
fs.writeFileSync('src/App.tsx', content);
