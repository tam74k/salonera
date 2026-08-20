import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { AppProvider, useAppContext } from './store';
import { Splash } from './screens/Splash';
import { AuthFlow } from './screens/Auth';
import { ClientApp } from './screens/ClientApp';
import { Dashboards } from './screens/Dashboards';
import { SuperAdminSettings } from './screens/SuperAdmin';
import { Globe, LogOut, Loader2, Settings, User as UserIcon } from 'lucide-react';
import { translations } from './i18n';
import { supabase } from './lib/supabase';

function MainLayout() {
  const { lang, setLang, isAr, role, setRole, isLoadingAuth, headerTitle, profile } = useAppContext();

  const getRoleName = (r: string, isAr: boolean) => {
    switch (r) {
      case 'client': return isAr ? 'عميل' : 'Client';
      case 'admin': return isAr ? 'إدارة الصالون' : 'Admin';
      case 'artist': return isAr ? 'فني' : 'Artist';
      case 'cashier': return isAr ? 'كاشير' : 'Cashier';
      case 'super_admin': return isAr ? 'مدير النظام' : 'Super Admin';
      default: return '';
    }
  };
  const t = translations[lang];
  const [showSplash, setShowSplash] = useState(true);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole('guest');
    setShowSuperAdmin(false);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col text-slate-900">
      {/* Global Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className={`text-2xl font-bold tracking-tight ${isAr ? 'font-arabic' : ''}`}>
          {headerTitle || 'SALONERA'}
        </h1>
        
        <div className="flex items-center gap-3">
          {role === 'super_admin' && (
            <button 
              onClick={() => setShowSuperAdmin(!showSuperAdmin)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${showSuperAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
      </header>

      {/* Router Logic based on Role */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {showSuperAdmin && role === 'super_admin' ? (
            <SuperAdminSettings key="superadmin" />
          ) : (
            <>
              {role === 'guest' && <AuthFlow onLogin={(r) => setRole(r)} />}
              {role === 'client' && <ClientApp key="client" />}
              {(role === 'artist' || role === 'admin' || role === 'cashier' || role === 'super_admin') && <Dashboards key="dashboards" />}
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

