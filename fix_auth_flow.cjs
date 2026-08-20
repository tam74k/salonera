const fs = require('fs');
let content = fs.readFileSync('src/screens/Auth.tsx', 'utf8');

// Add states
content = content.replace(
  "const [error, setError] = useState('');",
  "const [error, setError] = useState('');\n  const [salonNameAr, setSalonNameAr] = useState('');\n  const [salonNameEn, setSalonNameEn] = useState('');"
);

// Add validation to startRegistration
content = content.replace(
  /if \(!email \|\| !password \|\| !mobile\) \{/,
  `if (!email || !password || !mobile) {
      setError(isAr ? 'يرجى تعبئة جميع الحقول' : 'Please fill all fields');
      return;
    }
    if (selectedRole === 'admin' && (!salonNameAr || !salonNameEn)) {`
);

// Add salon creation after sign up
content = content.replace(
  /if \(signUpError\) throw signUpError;\n\s*\/\/ If auto-login is successful/,
  `if (signUpError) throw signUpError;
      
      if (selectedRole === 'admin' && data.user) {
         // Create the salon immediately
         const { error: salonErr } = await supabase.from('salons').insert({
             owner_id: data.user.id,
             name_ar: salonNameAr,
             name_en: salonNameEn,
             type: 'both',
             country: 'SA',
             currency: 'SAR'
         });
         if (salonErr) {
             console.error("Failed to insert salon:", salonErr);
         }
      }
      
      // If auto-login is successful`
);

// Add UI fields
const uiBlock = `                <div className="relative">
                  <select 
                    value={selectedRole === 'artist' ? 'client' : selectedRole} // Fallback
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className={\`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all \${isAr ? 'pl-4 pr-10' : 'pl-10 pr-4'}\`}
                  >
                    <option value="client">{isAr ? 'عميل' : 'Client'}</option>
                    <option value="admin">{isAr ? 'إدارة الصالون' : 'Salon Admin'}</option>
                  </select>
                  <ChevronDown className={\`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none \${isAr ? 'right-3' : 'left-3'}\`} />
                </div>
              </div>
              
              {selectedRole === 'admin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'اسم الصالون (عربي)' : 'Salon Name (Ar)'}</label>
                    <input type="text" required value={salonNameAr} onChange={(e) => setSalonNameAr(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" placeholder="مثال: صالون الجمال" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'اسم الصالون (انجليزي)' : 'Salon Name (En)'}</label>
                    <input type="text" required value={salonNameEn} onChange={(e) => setSalonNameEn(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" placeholder="e.g: Beauty Salon" />
                  </div>
                </div>
              )}`;

content = content.replace(
  /                <div className="relative">\s*<select[\s\S]*?<\/select>\s*<ChevronDown[\s\S]*?<\/div>\s*<\/div>/,
  uiBlock
);

fs.writeFileSync('src/screens/Auth.tsx', content);
console.log("Updated Auth.tsx");
