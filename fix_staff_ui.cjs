const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const anchorStart = `{showAddStaff && (
                  <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-[2rem]">`;
                  
const anchorEndString = `                      </button>
                    </div>
                  </div>
                )}`;

const startIndex = content.indexOf(anchorStart);
if (startIndex !== -1) {
  const endIndex = content.indexOf(anchorEndString, startIndex);
  if (endIndex !== -1) {
    const fullReplacement = `{showAddStaff && (
                  <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-[2rem]">
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
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'الصورة الشخصية' : 'Avatar Image'}</label>
                        <div className="flex items-center gap-3">
                          {newArtistData.avatar_url && <img src={newArtistData.avatar_url} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />}
                          <input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'staff');
                              if (url) setNewArtistData({...newArtistData, avatar_url: url});
                            }
                          }} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                        </div>
                      </div>
                      <div className="md:col-span-2 grid md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'نبذة مختصرة / خبرة (عربي)' : 'Bio / Experience (Arabic)'}</label>
                          <textarea rows={3} value={newArtistData.bio_ar} onChange={e => setNewArtistData({...newArtistData, bio_ar: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'نبذة مختصرة / خبرة (إنجليزي)' : 'Bio / Experience (English)'}</label>
                          <textarea rows={3} value={newArtistData.bio_en} onChange={e => setNewArtistData({...newArtistData, bio_en: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none"></textarea>
                        </div>
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
                  </div>
                )}`;
    
    content = content.slice(0, startIndex) + fullReplacement + content.slice(endIndex + anchorEndString.length);
    fs.writeFileSync('src/screens/Dashboards.tsx', content);
  }
}
