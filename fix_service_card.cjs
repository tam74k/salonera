const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const targetCard = `                    <div key={s.id} className="p-6 border border-zinc-100 rounded-[24px] bg-white flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-zinc-900/5 hover:border-zinc-200 hover:-translate-y-1 transition-all">
                      <div>
                        <h4 className="font-bold text-zinc-900 text-lg">{isAr ? s.name_ar : s.name_en}</h4>`;

const replacementCard = `                    <div key={s.id} className="p-6 border border-zinc-100 rounded-[24px] bg-white flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-zinc-900/5 hover:border-zinc-200 hover:-translate-y-1 transition-all relative">
                      <button 
                        onClick={() => handleEditService(s)}
                        className="absolute top-4 left-4 p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      </button>
                      <div>
                        <h4 className="font-bold text-zinc-900 text-lg ml-6">{isAr ? s.name_ar : s.name_en}</h4>`;

content = content.replace(targetCard, replacementCard);
fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log('Fixed card');
