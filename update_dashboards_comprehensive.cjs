const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// 1. Update salonSettingsData state
content = content.replace(
  "working_hours_start: '09:00', working_hours_end: '22:00', images: [],",
  "working_hours_start: '09:00', working_hours_end: '22:00', images: [], salon_type: 'both',"
);

// 2. Update handleSaveSettings
content = content.replace(
  "working_hours_end: salonSettingsData.working_hours_end,",
  "working_hours_end: salonSettingsData.working_hours_end,\n      salon_type: salonSettingsData.salon_type,"
);

// 3. Widen Search Box in Bookings (dashboard tab)
content = content.replace(
  `type="text" 
                      placeholder={isAr ? 'بحث بالاسم، الجوال، كود החجز' : 'Search by name, mobile, code'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"`,
  `type="text" 
                      placeholder={isAr ? 'بحث بالاسم، الجوال، كود الحجز' : 'Search by name, mobile, code'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"`
);

// 4. Reconstruct Settings Tab
const settingsTabCode = `
            {activeTab === 'settings' && (
              <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                    {isAr ? 'إعدادات الصالون' : 'Salon Settings'}
                  </h3>
                </div>

                <div className="grid md:grid-cols-1 gap-4 mb-4">
                  <AdminInput 
                      labelAr="اسم الصالون (عربي)" labelEn="Salon Name (English)" 
                      valueAr={salonSettingsData.name_ar} valueEn={salonSettingsData.name_en} 
                      onChangeAr={(v) => setSalonSettingsData({...salonSettingsData, name_ar: v})} 
                      onChangeEn={(v) => setSalonSettingsData({...salonSettingsData, name_en: v})} 
                  />
                </div>
                <div className="grid md:grid-cols-1 gap-4 mb-4">
                  <AdminInput 
                      labelAr="الوصف (عربي)" labelEn="Description (English)" 
                      valueAr={salonSettingsData.description_ar} valueEn={salonSettingsData.description_en} 
                      onChangeAr={(v) => setSalonSettingsData({...salonSettingsData, description_ar: v})} 
                      onChangeEn={(v) => setSalonSettingsData({...salonSettingsData, description_en: v})} 
                  />
                </div>
                <div className="grid md:grid-cols-1 gap-4 mb-4">
                  <AdminInput 
                      labelAr="العنوان (عربي)" labelEn="Address (English)" 
                      valueAr={salonSettingsData.address_ar} valueEn={salonSettingsData.address_en} 
                      onChangeAr={(v) => setSalonSettingsData({...salonSettingsData, address_ar: v})} 
                      onChangeEn={(v) => setSalonSettingsData({...salonSettingsData, address_en: v})} 
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'نوع الصالون' : 'Salon Type'}</label>
                    <select value={salonSettingsData.salon_type || 'both'} onChange={e => setSalonSettingsData({...salonSettingsData, salon_type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium">
                      <option value="both">{isAr ? 'رجالي ونسائي (Both)' : 'Both'}</option>
                      <option value="men">{isAr ? 'رجالي (Men)' : 'Men'}</option>
                      <option value="women">{isAr ? 'نسائي (Women)' : 'Women'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'رقم الجوال' : 'Mobile'}</label>
                    <input type="tel" value={salonSettingsData.mobile} onChange={e => setSalonSettingsData({...salonSettingsData, mobile: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input type="email" value={salonSettingsData.email} onChange={e => setSalonSettingsData({...salonSettingsData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'رقم الواتساب' : 'WhatsApp'}</label>
                    <input type="tel" value={salonSettingsData.whatsapp} onChange={e => setSalonSettingsData({...salonSettingsData, whatsapp: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'بداية الدوام' : 'Working Hours Start'}</label>
                    <input type="time" value={salonSettingsData.working_hours_start} onChange={e => setSalonSettingsData({...salonSettingsData, working_hours_start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'نهاية الدوام' : 'Working Hours End'}</label>
                    <input type="time" value={salonSettingsData.working_hours_end} onChange={e => setSalonSettingsData({...salonSettingsData, working_hours_end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" />
                  </div>
                </div>

                <div className="mt-8 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {isAr ? 'صور الصالون' : 'Salon Images'} (Max 3)
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex flex-col gap-2">
                      {salonSettingsData.images?.[i] ? (
                        <div className="relative group">
                          <img src={salonSettingsData.images[i]} alt="" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                          <button 
                            onClick={() => {
                               const newImages = [...salonSettingsData.images];
                               newImages.splice(i, 1);
                               setSalonSettingsData({...salonSettingsData, images: newImages});
                            }}
                            className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 flex-col">
                          <ImageIcon className="w-6 h-6 mb-2" />
                          <span className="text-xs">{isAr ? 'اضغط لرفع صورة' : 'Click to upload'}</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file, 'salons');
                                if (url) {
                                  const newImages = [...(salonSettingsData.images || [])];
                                  newImages[i] = url;
                                  setSalonSettingsData({...salonSettingsData, images: newImages.filter(Boolean)});
                                }
                              }
                            }} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {t.whatsapp_api_settings} (Evolution API)
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Instance Name</label>
                    <input type="text" value={evoInstance} onChange={(e) => setEvoInstance(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">API Key</label>
                    <input type="password" value={evoApiKey} onChange={(e) => setEvoApiKey(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                </div>

                <div className="mt-8 mb-6">
                  <h3 className="text-xl font-bold text-slate-900">{isAr ? 'الموقع الجغرافي (GPS)' : 'Location (GPS)'}</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'الدولة' : 'Country'}</label>
                    <select value={salonCountry} onChange={(e) => { setSalonCountry(e.target.value); setSalonCity(''); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-medium">
                      <option value="">{isAr ? 'اختر الدولة' : 'Select Country'}</option>
                      {COUNTRIES.map(c => <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'المدينة / المحافظة' : 'City / Governorate'}</label>
                    <select value={salonCity} onChange={(e) => setSalonCity(e.target.value)} disabled={!salonCountry} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-medium disabled:opacity-50">
                      <option value="">{isAr ? 'اختر المدينة' : 'Select City'}</option>
                      {salonCountry && COUNTRIES.find(c => c.id === salonCountry)?.cities.map(city => <option key={city.id} value={city.id}>{isAr ? city.name_ar : city.name_en}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{isAr ? 'إحداثيات الموقع (GPS)' : 'GPS Coordinates'}</p>
                    <p className="text-sm text-slate-500">
                      {salonLat && salonLng ? \`\${salonLat.toFixed(4)}, \${salonLng.toFixed(4)}\` : (isAr ? 'لم يتم تحديد الموقع بعد' : 'Location not set yet')}
                    </p>
                  </div>
                  <button onClick={handleCaptureLocation} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-200 transition-colors">
                    {isAr ? 'تحديث الموقع الحالي' : 'Update to Current Location'}
                  </button>
                </div>
                
                <button onClick={handleSaveSettings} disabled={isSavingSettings} className="mt-6 w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:bg-slate-600">
                  {isSavingSettings ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الإعدادات' : 'Save Settings')}
                </button>
              </section>
            )}
`;

if (!content.includes("{activeTab === 'settings' && (")) {
  content = content.replace("{activeTab === 'services' && (", settingsTabCode + "\n\n            {activeTab === 'services' && (");
}

fs.writeFileSync('src/screens/Dashboards.tsx', content);
