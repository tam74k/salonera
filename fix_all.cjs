const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// 1. Add states
content = content.replace("const [activeTab, setActiveTab] = useState('dashboard');",
  "const [activeTab, setActiveTab] = useState('dashboard');\n  const [artistTab, setArtistTab] = useState('today');\n  const [showBookingEditModal, setShowBookingEditModal] = useState(false);\n  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<any>(null);");

// Ensure AnimatePresence is imported
if (!content.includes('AnimatePresence')) {
  content = content.replace("import { motion } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");
}

// 2. Fix the Admin view map to include the "Edit" button and display Staff
const oldMap = `          ) : processedBookings.map((b, i) => (
            <div key={b.id} className="p-4 md:p-6 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                  #{b.id.substring(0, 4)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{isAr ? b.client?.first_name_ar : b.client?.first_name_en}</h4>
                  <p className="text-sm text-slate-500">{b.booking_date} • {b.booking_time}</p>
                  <p className="text-sm font-medium text-slate-600 mt-1">{isAr ? 'الموظف' : 'Staff'}: {isAr ? b.artist?.first_name_ar : b.artist?.first_name_en}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <select 
                  value={b.status} 
                  onChange={(e) => updateBookingStatus(b.id, e.target.value)}
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
        </div>`;

const newMap = `          ) : processedBookings.map((b, i) => {
             const staffName = b.staff?.profile ? (isAr ? b.staff.profile.first_name_ar : b.staff.profile.first_name_en) : (isAr ? 'أي موظف متاح' : 'Any Available Staff');
             return (
            <div key={b.id} className="p-4 md:p-6 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                  #{b.id.substring(0, 4)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{isAr ? (b.client?.first_name_ar || b.client?.first_name_en) : (b.client?.first_name_en || b.client?.first_name_ar)}</h4>
                  <p className="text-sm text-slate-500">{b.booking_date} • {b.booking_time}</p>
                  <p className="text-sm font-medium text-slate-600 mt-1">{isAr ? 'الموظف' : 'Staff'}: {staffName}</p>
                  
                  {b.details && b.details.length > 0 && (
                     <div className="mt-2 text-xs font-medium text-slate-500 flex flex-wrap gap-1">
                        {b.details.map((d: any, idx: number) => (
                           <span key={idx} className="bg-slate-200 px-2 py-1 rounded-md">
                             {isAr ? d.services?.name_ar : d.services?.name_en}
                           </span>
                        ))}
                     </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <select 
                  value={b.status} 
                  onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                  className={\`px-4 py-2.5 rounded-xl font-bold text-sm border-0 outline-none w-full \${
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
                
                <button 
                  onClick={() => {
                     setSelectedBookingForEdit(b);
                     setShowBookingEditModal(true);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-colors text-center w-full"
                >
                  {isAr ? 'تعديل / عرض التفاصيل' : 'Edit / View Details'}
                </button>
              </div>
            </div>
          )})}
        </div>`;

content = content.replace(oldMap, newMap);


// 3. Fix Artist Dashboard view
const oldArtistBlock = `  if (role === 'artist') {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-8 md:p-12 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-indigo-900/20">
          <div className="absolute right-0 top-0 opacity-10">
            <Scissors className="w-64 h-64 -mr-12 -mt-12 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold relative z-10 mb-2">{t.welcome_artist}</h2>
          <p className="text-indigo-200 relative z-10 font-medium">
            {isAr ? \`لديك \${artistBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length} مواعيد قادمة اليوم\` : \`You have \${artistBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length} upcoming appointments today\`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid gap-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              {t.today_bookings}
            </h3>
            {artistBookings.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-100">
                {isAr ? 'لا يوجد لديك مواعيد حتى الآن.' : 'You have no appointments yet.'}
              </div>
            ) : artistBookings.map((b, i) => (
              <motion.div 
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">{b.booking_time}</span>
                    <span className="text-sm font-medium text-slate-400">{b.booking_date}</span>
                    <StatusBadge status={b.status} isAr={isAr} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {b.client?.first_name_ar || 'Client'}
                  </h4>
                  <p className="text-slate-500 text-sm mt-1">
                    {b.details?.map((d: any) => isAr ? d.services?.name_ar : d.services?.name_en).join(' + ')}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-2 md:mt-0">
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateBookingStatus(b.id, 'completed', true)} className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20">
                      <CheckCircle2 className="w-4 h-4" />
                      {t.mark_completed}
                    </button>
                  )}
                  {b.status === 'pending' && (
                    <span className="text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                      {isAr ? 'بانتظار تأكيد الإدارة' : 'Awaiting Admin Confirmation'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }`;

const newArtistBlock = `  if (role === 'artist') {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-8 md:p-12 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-indigo-900/20">
          <div className="absolute right-0 top-0 opacity-10">
            <Scissors className="w-64 h-64 -mr-12 -mt-12 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold relative z-10 mb-2">{t.welcome_artist}</h2>
          <p className="text-indigo-200 relative z-10 font-medium">
            {isAr ? 'مرحباً بك في لوحة تحكم الفني' : 'Welcome to the Artist Dashboard'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
              <button 
                onClick={() => setArtistTab('today')}
                className={\`px-6 py-2.5 rounded-xl font-bold text-sm transition-all \${artistTab === 'today' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
              >
                {isAr ? 'حجوزات اليوم' : 'Today Bookings'}
              </button>
              <button 
                onClick={() => setArtistTab('upcoming')}
                className={\`px-6 py-2.5 rounded-xl font-bold text-sm transition-all \${artistTab === 'upcoming' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
              >
                {isAr ? 'حجوزات قادمة' : 'Upcoming Bookings'}
              </button>
              <button 
                onClick={() => setArtistTab('past')}
                className={\`px-6 py-2.5 rounded-xl font-bold text-sm transition-all \${artistTab === 'past' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
              >
                {isAr ? 'حجوزات سابقة' : 'Past Bookings'}
              </button>
            </div>

            <div className="grid gap-4">
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const filtered = artistBookings.filter(b => {
                   if (artistTab === 'today') {
                      return b.booking_date === todayStr && (b.status === 'confirmed' || b.status === 'pending');
                   } else if (artistTab === 'upcoming') {
                      return b.booking_date > todayStr && (b.status === 'confirmed' || b.status === 'pending');
                   } else {
                      return b.booking_date < todayStr || b.status === 'completed' || b.status === 'canceled';
                   }
                }).sort((a, b) => {
                   const dA = new Date(\`\${a.booking_date}T\${a.booking_time}\`).getTime();
                   const dB = new Date(\`\${b.booking_date}T\${b.booking_time}\`).getTime();
                   return artistTab === 'past' ? dB - dA : dA - dB;
                });

                if (filtered.length === 0) {
                   return (
                      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-100">
                        {isAr ? 'لا يوجد مواعيد في هذا القسم' : 'No bookings in this section'}
                      </div>
                   );
                }

                return filtered.map((b, i) => (
                  <motion.div 
                    key={b.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">{b.booking_time}</span>
                        <span className="text-sm font-medium text-slate-400">{b.booking_date}</span>
                        <StatusBadge status={b.status} isAr={isAr} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {isAr ? (b.client?.first_name_ar || b.client?.first_name_en) : (b.client?.first_name_en || b.client?.first_name_ar) || 'Client'}
                      </h4>
                      <p className="text-slate-500 text-sm mt-1 flex flex-wrap gap-1">
                        {b.details?.map((d: any, idx: number) => (
                          <span key={idx} className="bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-medium text-xs">
                             {isAr ? d.services?.name_ar : d.services?.name_en}
                          </span>
                        ))}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                      {artistTab === 'today' && b.status === 'confirmed' && (
                        <button onClick={() => updateBookingStatus(b.id, 'completed', true)} className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20">
                          <CheckCircle2 className="w-4 h-4" />
                          {isAr ? 'تأكيد وصول العميل (مكتمل)' : 'Mark Arrived (Completed)'}
                        </button>
                      )}
                      {artistTab === 'today' && b.status === 'pending' && (
                        <span className="text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                          {isAr ? 'بانتظار الإدارة' : 'Awaiting Admin'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    );
  }`;

if (content.includes("if (role === 'artist') {")) {
  content = content.replace(oldArtistBlock, newArtistBlock);
}


// 4. Append the Edit Modal to the very end of the component return statement.
const modalHTML = `
      {/* Edit Booking Modal */}
      <AnimatePresence>
         {showBookingEditModal && selectedBookingForEdit && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            >
               <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
               >
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-2xl font-bold text-slate-900">{isAr ? 'تعديل الحجز' : 'Edit Booking'} #{selectedBookingForEdit.id.substring(0,4)}</h3>
                     <button onClick={() => {setShowBookingEditModal(false); setSelectedBookingForEdit(null);}} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors">
                        <XCircle className="w-5 h-5" />
                     </button>
                  </div>
                  
                  <div className="space-y-5">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-900">{isAr ? 'العميل' : 'Client'}: {isAr ? (selectedBookingForEdit.client?.first_name_ar || selectedBookingForEdit.client?.first_name_en) : (selectedBookingForEdit.client?.first_name_en || selectedBookingForEdit.client?.first_name_ar)}</p>
                        <p className="text-slate-500 mt-1">{isAr ? 'رقم الهاتف' : 'Mobile'}: <span dir="ltr">{selectedBookingForEdit.client?.mobile}</span></p>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'تاريخ الحجز' : 'Booking Date'}</label>
                        <input 
                           type="date"
                           value={selectedBookingForEdit.booking_date}
                           onChange={(e) => setSelectedBookingForEdit({...selectedBookingForEdit, booking_date: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                        />
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'وقت الحجز' : 'Booking Time'}</label>
                        <input 
                           type="time"
                           value={selectedBookingForEdit.booking_time}
                           onChange={(e) => setSelectedBookingForEdit({...selectedBookingForEdit, booking_time: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                        />
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'الفني / الموظف' : 'Staff Member'}</label>
                        <select
                           value={selectedBookingForEdit.staff_id || ''}
                           onChange={(e) => setSelectedBookingForEdit({...selectedBookingForEdit, staff_id: e.target.value || null})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                        >
                           <option value="">{isAr ? 'أي موظف متاح' : 'Any Available Staff'}</option>
                           {staffList.map((s: any) => (
                              <option key={s.id} value={s.id}>
                                 {isAr ? s.profile?.first_name_ar : s.profile?.first_name_en}
                              </option>
                           ))}
                        </select>
                     </div>
                     
                     <div className="pt-4 border-t border-slate-100 flex gap-3">
                        <button 
                           onClick={async () => {
                              try {
                                 const { error } = await supabase.from('bookings').update({
                                    booking_date: selectedBookingForEdit.booking_date,
                                    booking_time: selectedBookingForEdit.booking_time,
                                    staff_id: selectedBookingForEdit.staff_id
                                 }).eq('id', selectedBookingForEdit.id);
                                 
                                 if (error) throw error;
                                 
                                 setBookings(bookings.map(b => b.id === selectedBookingForEdit.id ? selectedBookingForEdit : b));
                                 setShowBookingEditModal(false);
                                 setSelectedBookingForEdit(null);
                                 alert(isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
                              } catch(err: any) {
                                 alert((isAr ? 'حدث خطأ' : 'Error') + ': ' + err.message);
                              }
                           }}
                           className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-colors"
                        >
                           {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                        </button>
                        <button 
                           onClick={() => {setShowBookingEditModal(false); setSelectedBookingForEdit(null);}}
                           className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                        >
                           {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
`;
if (!content.includes("{/* Edit Booking Modal */}")) {
  content = content.replace(/    <\/div>\n  \);\n\}\n\nfunction StatCard/m, modalHTML + "    </div>\n  );\n}\n\nfunction StatCard");
}

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Everything updated successfully.");
