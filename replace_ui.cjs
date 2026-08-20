const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const settingsTabStart = `            {activeTab === 'settings' && (`;
const settingsTabEnd = `            {activeTab === 'services' && (`

const newSettingsTab = `
            {activeTab === 'settings' && (
              <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                    {isAr ? 'إعدادات الصالون' : 'Salon Settings'}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <AdminInput 
                      labelAr="اسم الصالون (عربي)" labelEn="Salon Name (English)" 
                      valueAr={salonSettingsData.name_ar} valueEn={salonSettingsData.name_en} 
                      onChangeAr={(v) => setSalonSettingsData({...salonSettingsData, name_ar: v})} 
                      onChangeEn={(v) => setSalonSettingsData({...salonSettingsData, name_en: v})} 
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <AdminInput 
                      labelAr="الوصف (عربي)" labelEn="Description (English)" 
                      valueAr={salonSettingsData.description_ar} valueEn={salonSettingsData.description_en} 
                      onChangeAr={(v) => setSalonSettingsData({...salonSettingsData, description_ar: v})} 
                      onChangeEn={(v) => setSalonSettingsData({...salonSettingsData, description_en: v})} 
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <AdminInput 
                      labelAr="العنوان (عربي)" labelEn="Address (English)" 
                      valueAr={salonSettingsData.address_ar} valueEn={salonSettingsData.address_en} 
                      onChangeAr={(v) => setSalonSettingsData({...salonSettingsData, address_ar: v})} 
                      onChangeEn={(v) => setSalonSettingsData({...salonSettingsData, address_en: v})} 
                  />
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
                
                <button onClick={handleSaveSettings} disabled={isSavingSettings} className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:bg-slate-600">
                  {isSavingSettings ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الإعدادات' : 'Save Settings')}
                </button>
              </section>
            )}

            {activeTab === 'services' && (
`;

let startIndex = content.indexOf(settingsTabStart);
let endIndex = content.indexOf(settingsTabEnd);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + newSettingsTab + content.slice(endIndex + settingsTabEnd.length);
}

// Add discount price input to Add Service
const srvPriceInput = `
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'السعر' : 'Price'}</label>
                        <input type="number" value={srvPrice} onChange={e => setSrvPrice(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'السعر (بعد الخصم اختياري)' : 'Discount Price (Optional)'}</label>
                        <input type="number" value={srvDiscountPrice} onChange={e => setSrvDiscountPrice(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5" />
                      </div>
`;
content = content.replace(/<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1\.5">\{isAr \? 'السعر' : 'Price'\}<\/label>\s*<input[^>]*value=\{srvPrice\}[^>]*>\s*<\/div>/g, srvPriceInput);

// Replace "Save Service" Button not working (add onClick)
const oldSaveBtn = `<button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">`;
const newSaveBtn = `<button onClick={handleSaveService} disabled={isSavingSrv} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">`;
content = content.replace(oldSaveBtn, newSaveBtn);

// Replace Add Staff Modal with the comprehensive one
const addStaffOld = `<div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-[2rem]">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {isAr ? 'رقم الجوال أو البريد الإلكتروني للموظف' : 'Staff Mobile or Email'}
                        </label>
                        <input 
                          type="text" 
                          value={staffIdentifier}
                          onChange={(e) => setStaffIdentifier(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
                          placeholder={isAr ? "أدخل رقم الجوال أو البريد" : "Enter mobile or email"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {isAr ? 'المنصب' : 'Role'}
                        </label>
                        <select 
                          value={staffRole}
                          onChange={(e) => setStaffRole(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        >
                          <option value="artist">{isAr ? 'فني / خبير' : 'Artist / Specialist'}</option>
                          <option value="cashier">{isAr ? 'كاشير' : 'Cashier'}</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={handleSaveStaff}
                        disabled={isSavingStaff}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:bg-slate-400"
                      >
                        {isSavingStaff ? (isAr ? 'جاري الإضافة...' : 'Adding...') : (isAr ? 'إضافة موظف' : 'Add Staff')}
                      </button>
                    </div>
                  </div>`;

const addStaffNew = `<div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-[2rem]">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <AdminInput 
                          labelAr="الاسم الأول (عربي)" labelEn="First Name (English)" 
                          valueAr={newArtistData.first_name_ar} valueEn={newArtistData.first_name_en} 
                          onChangeAr={(v) => setNewArtistData({...newArtistData, first_name_ar: v})} 
                          onChangeEn={(v) => setNewArtistData({...newArtistData, first_name_en: v})} 
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                        <input type="email" value={newArtistData.email} onChange={(e) => setNewArtistData({...newArtistData, email: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'رقم الجوال' : 'Mobile'}</label>
                        <input type="tel" value={newArtistData.mobile} onChange={(e) => setNewArtistData({...newArtistData, mobile: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'كلمة المرور (افتراضي)' : 'Password (Default)'}</label>
                        <input type="text" value={newArtistData.password} onChange={(e) => setNewArtistData({...newArtistData, password: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'رابط الصورة الرمزية (اختياري)' : 'Avatar URL (Optional)'}</label>
                        <input type="url" value={newArtistData.avatar_url} onChange={(e) => setNewArtistData({...newArtistData, avatar_url: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5" placeholder="https://" />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={handleSaveNewArtist}
                        disabled={isSavingStaff}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:bg-slate-400"
                      >
                        {isSavingStaff ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ فني جديد' : 'Save New Artist')}
                      </button>
                    </div>
                  </div>`;
content = content.replace(addStaffOld, addStaffNew);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
