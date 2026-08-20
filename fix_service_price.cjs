const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const oldPriceHtml = `<span className="font-black text-indigo-700 text-lg">SAR {s.original_price}</span>`;
const newPriceHtml = `
                          <div className="flex flex-col">
                            {s.discount_price ? (
                              <>
                                <span className="text-xs text-slate-400 line-through">SAR {s.original_price}</span>
                                <span className="font-black text-emerald-600 text-lg">SAR {s.discount_price}</span>
                              </>
                            ) : (
                              <span className="font-black text-indigo-700 text-lg">SAR {s.original_price}</span>
                            )}
                          </div>
`;

content = content.replace(oldPriceHtml, newPriceHtml);
fs.writeFileSync('src/screens/Dashboards.tsx', content);
