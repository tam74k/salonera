const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const isCompleteLogic = `
  const isSalonComplete = salonData && salonData.mobile && salonData.address_ar && salonData.name_ar;

  useEffect(() => {
    if (role === 'admin' && salonData && !isSalonComplete) {
      setActiveTab('settings');
    }
  }, [salonData, role, isSalonComplete]);
`;

content = content.replace(
  /useEffect\(\(\) => \{\n    if \(user\) \{/,
  isCompleteLogic + "\n  useEffect(() => {\n    if (user) {"
);

// For NavButtons, disable them if not complete
content = content.replace(
  /<NavButton icon=\{LayoutDashboard\}.*?\/>/g,
  "{isSalonComplete && <NavButton icon={LayoutDashboard} label={t.dashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />}"
);
content = content.replace(
  /<NavButton icon=\{Users\}.*?\/>/g,
  "{isSalonComplete && <NavButton icon={Users} label={t.staff_management} active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />}"
);
content = content.replace(
  /<NavButton icon=\{Scissors\}.*?\/>/g,
  "{isSalonComplete && <NavButton icon={Scissors} label={t.services_management} active={activeTab === 'services'} onClick={() => setActiveTab('services')} />}"
);

// Change the 'settings' label to 'إعدادات الصالون (يرجى الاستكمال)' if not complete
content = content.replace(
  /<NavButton icon=\{MessageSquare\} label=\{t.whatsapp_api_settings\} active=\{activeTab === 'settings'\} onClick=\{\(\) => setActiveTab\('settings'\)\} \/>/,
  `<NavButton icon={MessageSquare} label={isSalonComplete ? t.whatsapp_api_settings : (isAr ? 'إعدادات الصالون (مطلوب)' : 'Salon Settings (Required)')} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />`
);

// Show an alert if not complete in settings tab
content = content.replace(
  /\{activeTab === 'settings' && \(\n\s*<section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">/,
  `{activeTab === 'settings' && (
              <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                {!isSalonComplete && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <p className="font-medium text-sm">
                      {isAr ? 'يرجى استكمال بيانات الصالون الأساسية (رقم الجوال والعنوان) لتتمكن من استخدام باقي خصائص لوحة التحكم.' : 'Please complete your basic salon data (mobile and address) to unlock the rest of the dashboard features.'}
                    </p>
                  </div>
                )}`
);


fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Enforced complete settings in Dashboards.tsx");
