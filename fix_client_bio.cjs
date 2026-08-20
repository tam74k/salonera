const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const anchor = `<div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{isAr ? 'اختر الوقت' : 'Select Time'}</h3>`;

const bioUI = `
            {selectedStaff && salonStaff.find(s => s.id === selectedStaff)?.profile?.bio_ar && (
              <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex gap-4 items-start">
                {salonStaff.find(s => s.id === selectedStaff)?.profile?.avatar_url ? (
                  <img src={salonStaff.find(s => s.id === selectedStaff)?.profile?.avatar_url} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {isAr ? salonStaff.find(s => s.id === selectedStaff)?.profile?.first_name_ar : salonStaff.find(s => s.id === selectedStaff)?.profile?.first_name_en}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {isAr ? salonStaff.find(s => s.id === selectedStaff)?.profile?.bio_ar : salonStaff.find(s => s.id === selectedStaff)?.profile?.bio_en}
                  </p>
                </div>
              </div>
            )}
`;

content = content.replace(anchor, bioUI + anchor);
// User icon is needed
if (!content.includes('User,') && !content.includes('User ')) {
  content = content.replace('import { ', 'import { User, ');
}

fs.writeFileSync('src/screens/ClientApp.tsx', content);
