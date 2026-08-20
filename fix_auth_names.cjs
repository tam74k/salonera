const fs = require('fs');
let content = fs.readFileSync('src/screens/Auth.tsx', 'utf8');

content = content.replace("const [salonNameEn, setSalonNameEn] = useState('');", 
  "const [salonNameEn, setSalonNameEn] = useState('');\n  const [firstNameAr, setFirstNameAr] = useState('');\n  const [firstNameEn, setFirstNameEn] = useState('');");

// Update handleVerifyOTP
const verifyOTPReplacement = `
      if (signUpError) throw signUpError;
      
      if (data.user) {
        await supabase.from('profiles').update({
          first_name_ar: firstNameAr || firstNameEn,
          first_name_en: firstNameEn || firstNameAr
        }).eq('id', data.user.id);
      }
      
      if (selectedRole === 'admin' && data.user) {`;

content = content.replace("if (signUpError) throw signUpError;\n      \n      if (selectedRole === 'admin' && data.user) {", verifyOTPReplacement);


// Update startRegistration
const startRegReplacement = `const startRegistration = async () => {
    if (!email || !password || !mobile || !firstNameAr || !firstNameEn) {
      setError(isAr ? 'يرجى تعبئة جميع الحقول' : 'Please fill all fields');
      return;
    }`;

content = content.replace(/const startRegistration = async \(\) => \{\s+if \(!email \|\| !password \|\| !mobile\) \{[\s\S]*?return;\s+\}/, startRegReplacement);


// Add inputs to register form (client and admin both need names)
const inputsReplacement = `
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.email}</label>
`;

content = content.replace(/<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1\.5">\{t\.email\}<\/label>/, inputsReplacement);

fs.writeFileSync('src/screens/Auth.tsx', content);
console.log("Auth.tsx updated with names");
