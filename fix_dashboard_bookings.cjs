const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

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
             const staffName = b.staff?.profiles ? (isAr ? b.staff.profiles.first_name_ar : b.staff.profiles.first_name_en) : (isAr ? 'أي موظف متاح' : 'Any Available Staff');
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

// We also need to declare selectedBookingForEdit and showBookingEditModal states in Dashboards.tsx
content = content.replace("const [activeTab, setActiveTab] = useState('dashboard');", 
  "const [activeTab, setActiveTab] = useState('dashboard');\n  const [showBookingEditModal, setShowBookingEditModal] = useState(false);\n  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<any>(null);");

content = content.replace(oldMap, newMap);

// Add the modal component at the end before final </div>
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
    </div>
`;
content = content.replace(/    <\/div>\s*$/m, modalHTML);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Dashboards.tsx updated with edit modal");
