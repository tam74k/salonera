const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importRegex = /import \{ Globe, LogOut, Loader2, Settings \} from 'lucide-react';/;
content = content.replace(importRegex, "import { Globe, LogOut, Loader2, Settings, User as UserIcon } from 'lucide-react';");

const mainLayoutRegex = /const \{ lang, setLang, isAr, role, setRole, isLoadingAuth, headerTitle \} = useAppContext\(\);/;
content = content.replace(mainLayoutRegex, `const { lang, setLang, isAr, role, setRole, isLoadingAuth, headerTitle, profile } = useAppContext();

  const getRoleName = (r: string, isAr: boolean) => {
    switch (r) {
      case 'client': return isAr ? 'عميل' : 'Client';
      case 'admin': return isAr ? 'إدارة الصالون' : 'Admin';
      case 'artist': return isAr ? 'فني' : 'Artist';
      case 'cashier': return isAr ? 'كاشير' : 'Cashier';
      case 'super_admin': return isAr ? 'مدير النظام' : 'Super Admin';
      default: return '';
    }
  };`);

const headerOld = `      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className={\`text-2xl font-bold tracking-tight \${isAr ? 'font-arabic' : ''}\`}>
          {headerTitle || 'SALONERA'}
        </h1>
        
        <div className="flex items-center gap-3">
          {role === 'super_admin' && (
            <button 
              onClick={() => setShowSuperAdmin(!showSuperAdmin)}
              className={\`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors \${showSuperAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}\`}
              title="Super Admin Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-semibold transition-colors text-slate-700"
          >
            <Globe className="w-4 h-4" />
            {isAr ? 'EN' : 'عربي'}
          </button>
          
          {role !== 'guest' && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-full text-sm font-semibold transition-colors"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>`;

const headerNew = `      <header className="bg-white/90 backdrop-blur-xl border-b border-zinc-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <h1 className={\`text-2xl font-extrabold tracking-tight text-zinc-900 \${isAr ? 'font-arabic' : ''}\`}>
          {headerTitle || 'SALONERA'}
        </h1>
        
        <div className="flex items-center gap-4">
          
          {role !== 'guest' && profile && (
            <div className="hidden md:flex items-center gap-3 mr-2 pr-4 border-r border-zinc-200 rtl:border-r-0 rtl:border-l rtl:pl-4 rtl:mr-0 rtl:ml-2">
              <div className={\`flex flex-col \${isAr ? 'text-left' : 'text-right'}\`}>
                <span className="text-sm font-bold text-zinc-900 leading-tight">
                  {isAr ? (profile.first_name_ar || profile.first_name_en) : (profile.first_name_en || profile.first_name_ar)}
                </span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5">
                  {getRoleName(role, isAr)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 font-bold overflow-hidden shadow-sm">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-zinc-400" />
                )}
              </div>
            </div>
          )}

          {role === 'super_admin' && (
            <button 
              onClick={() => setShowSuperAdmin(!showSuperAdmin)}
              className={\`flex items-center gap-2 p-2.5 rounded-full text-sm font-semibold transition-all \${showSuperAdmin ? 'bg-zinc-900 text-white shadow-md' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}\`}
              title="Super Admin Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-full text-sm font-bold transition-all text-zinc-800"
          >
            <Globe className="w-4 h-4" />
            {isAr ? 'EN' : 'عربي'}
          </button>
          
          {role !== 'guest' && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 p-2.5 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 rounded-full text-sm font-semibold transition-colors"
              title={t.logout}
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>`;

content = content.replace(headerOld, headerNew);
content = content.replace(/bg-slate-50/g, "bg-[#FAFAFA]");

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx UI");
