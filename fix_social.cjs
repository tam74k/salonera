const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const socialSection = `

                <div className="mt-8 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {isAr ? 'حسابات التواصل الاجتماعي (اختياري)' : 'Social Media Accounts (Optional)'}
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Instagram</label>
                    <input type="text" placeholder="@username" value={salonSettingsData.instagram} onChange={e => setSalonSettingsData({...salonSettingsData, instagram: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">TikTok</label>
                    <input type="text" placeholder="@username" value={salonSettingsData.tiktok} onChange={e => setSalonSettingsData({...salonSettingsData, tiktok: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">X (Twitter)</label>
                    <input type="text" placeholder="@username" value={salonSettingsData.x} onChange={e => setSalonSettingsData({...salonSettingsData, x: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Facebook</label>
                    <input type="text" placeholder="Page URL or Username" value={salonSettingsData.facebook} onChange={e => setSalonSettingsData({...salonSettingsData, facebook: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                </div>
`;

content = content.replace(
  "                <div className=\"mt-8 mb-6\">\n                  <h3 className=\"text-xl font-bold text-slate-900 flex items-center gap-2\">\n                    {t.whatsapp_api_settings} (Evolution API)\n                  </h3>",
  socialSection + "                <div className=\"mt-8 mb-6\">\n                  <h3 className=\"text-xl font-bold text-slate-900 flex items-center gap-2\">\n                    {t.whatsapp_api_settings} (Evolution API)\n                  </h3>"
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Social media injected!");
