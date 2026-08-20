const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// 1. Update newArtistData state
content = content.replace(
  "email: '', mobile: '', first_name_ar: '', first_name_en: '', password: '123456', avatar_url: ''",
  "email: '', mobile: '', first_name_ar: '', first_name_en: '', password: '123456', avatar_url: '', bio_ar: '', bio_en: ''"
);

// 2. Update handleSaveNewArtist to include bio
content = content.replace(
  "p_avatar_url: newArtistData.avatar_url",
  "p_avatar_url: newArtistData.avatar_url,\n        p_bio_ar: newArtistData.bio_ar,\n        p_bio_en: newArtistData.bio_en"
);

// 3. Add handleFileUpload function after handleSaveNewArtist
const fileUploadLogic = `
  const handleFileUpload = async (file: File, bucket: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = \`\${Math.random().toString(36).substring(2)}-\${Date.now()}.\${fileExt}\`;
      const filePath = \`\${fileName}\`;
      
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    } catch (e) {
      console.error('Upload Error:', e);
      alert('Error uploading file');
      return null;
    }
  };
`;
if (!content.includes('handleFileUpload')) {
  content = content.replace("const handleSaveNewArtist", fileUploadLogic + "\n  const handleSaveNewArtist");
}

// 4. Update the dashboard tab to show bookings list and filters
const dashboardTabOld = `            {activeTab === 'dashboard' && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title={t.today_bookings} value={bookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length.toString()} />
                <StatCard title={isAr ? 'إجمالي الحجوزات' : 'Total Bookings'} value={bookings.length.toString()} />
                <StatCard title={isAr ? 'الحجوزات المكتملة' : 'Completed'} value={bookings.filter(b => b.status === 'completed').length.toString()} />
              </section>
            )}`;

const dashboardTabNew = `            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard title={t.today_bookings} value={bookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length.toString()} />
                  <StatCard title={isAr ? 'إجمالي الحجوزات' : 'Total Bookings'} value={bookings.length.toString()} />
                  <StatCard title={isAr ? 'الحجوزات المكتملة' : 'Completed'} value={bookings.filter(b => b.status === 'completed').length.toString()} />
                </section>
                
                <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    {isAr ? 'قائمة الحجوزات' : 'Bookings List'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <input 
                      type="text" 
                      placeholder={isAr ? 'بحث بالاسم، الجوال، كود החجز' : 'Search by name, mobile, code'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input 
                      type="date" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors" onClick={() => {
                        const code = prompt(isAr ? 'أدخل كود الحجز من الـ QR' : 'Enter QR Booking Code');
                        if(code) setSearchQuery(code);
                    }}>
                      <XCircle className="w-4 h-4 hidden" /> 
                      {isAr ? 'مسح QR / كود' : 'Scan QR / Code'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">{t.no_bookings}</p>
                    ) : bookings.filter(b => 
                        (b.client.first_name_en?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.client.first_name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.client.mobile?.includes(searchQuery) ||
                         b.id.includes(searchQuery) ||
                         b.booking_date.includes(searchQuery))
                    ).map((b, i) => (
                      <div key={b.id} className="p-4 md:p-6 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                            #{bookings.length - i}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{isAr ? b.client.first_name_ar : b.client.first_name_en}</h4>
                            <p className="text-sm text-slate-500">{b.booking_date} • {b.booking_time}</p>
                            <p className="text-sm font-medium text-slate-600 mt-1">{isAr ? 'الموظف' : 'Staff'}: {isAr ? b.artist.first_name_ar : b.artist.first_name_en}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <select 
                            value={b.status} 
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                            className={\`px-4 py-2.5 rounded-xl font-bold text-sm border-0 outline-none w-full md:w-auto \${
                              b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                              b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                              b.status === 'completed' ? 'bg-indigo-100 text-indigo-700' : 
                              'bg-rose-100 text-rose-700'
                            }\`}
                          >
                            <option value="pending">{t.pending}</option>
                            <option value="confirmed">{t.confirmed}</option>
                            <option value="completed">{t.completed}</option>
                            <option value="cancelled">{t.cancelled}</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}`;

content = content.replace(dashboardTabOld, dashboardTabNew);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
