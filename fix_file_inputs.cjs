const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// Update staff UI
const oldAvatarUrl = `<div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'رابط الصورة الرمزية (اختياري)' : 'Avatar URL (Optional)'}</label>
                        <input type="url" value={newArtistData.avatar_url} onChange={(e) => setNewArtistData({...newArtistData, avatar_url: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5" placeholder="https://" />
                      </div>`;

const newAvatarUpload = `<div>
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
                      </div>`;

content = content.replace(oldAvatarUrl, newAvatarUpload);

// Update Salon Images UI
const oldSalonImages = `<input 
                        type="url" 
                        value={salonSettingsData.images[i] || ''} 
                        onChange={e => {
                          const newImages = [...salonSettingsData.images];
                          newImages[i] = e.target.value;
                          setSalonSettingsData({...salonSettingsData, images: newImages.filter(Boolean)});
                        }} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" 
                        placeholder="https://" 
                        dir="ltr"
                      />`;

const newSalonImagesUpload = `<div className="flex flex-col gap-2">
                        {salonSettingsData.images[i] && <img src={salonSettingsData.images[i]} alt="" className="w-full h-32 object-cover rounded-xl border border-slate-200" />}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'salons');
                              if (url) {
                                const newImages = [...salonSettingsData.images];
                                newImages[i] = url;
                                setSalonSettingsData({...salonSettingsData, images: newImages.filter(Boolean)});
                              }
                            }
                          }} 
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" 
                        />
                      </div>`;

content = content.replace(oldSalonImages, newSalonImagesUpload);
content = content.replace(oldSalonImages, newSalonImagesUpload);
content = content.replace(oldSalonImages, newSalonImagesUpload);


fs.writeFileSync('src/screens/Dashboards.tsx', content);
