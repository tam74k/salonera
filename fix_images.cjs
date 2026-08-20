const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

content = content.replace(
  "{salon.image_url && <img src={salon.image_url} alt={isAr ? salon.name_ar : salon.name_en}",
  "{(salon.images?.[0] || salon.image_url) && <img src={salon.images?.[0] || salon.image_url} alt={isAr ? salon.name_ar : salon.name_en}"
);

const memberAvatarOld = `className={\`flex-shrink-0 snap-start px-6 py-3 rounded-xl border-2 font-bold cursor-pointer transition-colors \${selectedStaff === member.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}\`}`;
const memberAvatarNew = `className={\`flex-shrink-0 snap-start px-6 py-3 rounded-xl border-2 font-bold cursor-pointer transition-colors flex items-center gap-3 \${selectedStaff === member.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}\`}`;
content = content.replace(memberAvatarOld, memberAvatarNew);

const memberNameOld = `{isAr ? (member.profile?.first_name_ar || 'فني') : (member.profile?.first_name_en || 'Artist')}`;
const memberNameNew = `
                  {member.profile?.avatar_url && (
                    <img src={member.profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  )}
                  {isAr ? (member.profile?.first_name_ar || 'فني') : (member.profile?.first_name_en || 'Artist')}
`;

content = content.replace(memberNameOld, memberNameNew);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
