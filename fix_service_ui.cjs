const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const targetStr = `<div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.original_price}</label>
                        <input type="number" value={srvPrice} onChange={(e) => setSrvPrice(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.duration} (Minutes)</label>
                        <input type="number" value={srvDuration} onChange={(e) => setSrvDuration(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                    </div>`;

const newStr = `<div className="grid md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.original_price}</label>
                        <input type="number" value={srvPrice} onChange={(e) => setSrvPrice(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'السعر (بعد الخصم اختياري)' : 'Discount Price (Optional)'}</label>
                        <input type="number" value={srvDiscountPrice} onChange={(e) => setSrvDiscountPrice(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.duration} (Minutes)</label>
                        <input type="number" value={srvDuration} onChange={(e) => setSrvDuration(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                    </div>`;

content = content.replace(targetStr, newStr);
fs.writeFileSync('src/screens/Dashboards.tsx', content);
