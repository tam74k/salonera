const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const anchor = `<div className="mt-8 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {t.whatsapp_api_settings} (Evolution API)`;

const imageInputs = `
                <div className="mt-8 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {isAr ? 'صور الصالون' : 'Salon Images'} (Max 3)
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[0, 1, 2].map(i => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? \`رابط الصورة \${i + 1}\` : \`Image URL \${i + 1}\`}</label>
                      <input 
                        type="url" 
                        value={salonSettingsData.images[i] || ''} 
                        onChange={e => {
                          const newImages = [...salonSettingsData.images];
                          newImages[i] = e.target.value;
                          setSalonSettingsData({...salonSettingsData, images: newImages.filter(Boolean)});
                        }} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" 
                        placeholder="https://" 
                        dir="ltr"
                      />
                    </div>
                  ))}
                </div>
`;

content = content.replace(anchor, imageInputs + anchor);
fs.writeFileSync('src/screens/Dashboards.tsx', content);
