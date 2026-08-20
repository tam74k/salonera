const fs = require('fs');
let content = fs.readFileSync('src/screens/Auth.tsx', 'utf8');

const badBlock = `              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'الاسم الأول (عربي)' : 'First Name (Ar)'}</label>
                    <input type="text" required value={firstNameAr} onChange={(e) => setFirstNameAr(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'الاسم الأول (انجليزي)' : 'First Name (En)'}</label>
                    <input type="text" required value={firstNameEn} onChange={(e) => setFirstNameEn(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" />
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.email}</label>`;

// Revert the login section
content = content.replace(badBlock, `              <div>\n                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.email}</label>`);

const registerSectionStart = `{selectedRole === 'admin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>`;

const newRegisterSection = `
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'الاسم الأول (عربي)' : 'First Name (Ar)'}</label>
                    <input type="text" required value={firstNameAr} onChange={(e) => setFirstNameAr(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'الاسم الأول (انجليزي)' : 'First Name (En)'}</label>
                    <input type="text" required value={firstNameEn} onChange={(e) => setFirstNameEn(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" />
                  </div>
              </div>

              {selectedRole === 'admin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>`;

content = content.replace(registerSectionStart, newRegisterSection);

fs.writeFileSync('src/screens/Auth.tsx', content);
console.log("Fixed name inputs position.");
