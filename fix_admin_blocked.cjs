const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// 1. Add CalendarOff to lucide-react imports if not there
if (!content.includes('CalendarOff')) {
  content = content.replace("import { X, CheckCircle2, Image as ImageIcon, Clock, PlusCircle, Settings, Users, Calendar, LayoutDashboard, MessageSquare, Scissors, XCircle, Loader2 }", 
    "import { X, CheckCircle2, Image as ImageIcon, Clock, PlusCircle, Settings, Users, Calendar, CalendarOff, LayoutDashboard, MessageSquare, Scissors, XCircle, Loader2 }");
}

// 2. Add end_time to timeOffData and blockedTimes state
content = content.replace(
  "const [timeOffData, setTimeOffData] = useState({ date: '', staff_id: '', type: 'full_day', time: '10:00' });",
  "const [timeOffData, setTimeOffData] = useState({ date: '', staff_id: '', type: 'full_day', time: '10:00', end_time: '11:00', reason: '' });\n  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);"
);

// 3. Add to fetchSalonAndBookings
const fetchTarget = `const [bData, sData, stfData] = await Promise.all([`;
const fetchReplace = `const [bData, sData, stfData, btData] = await Promise.all([`;
content = content.replace(fetchTarget, fetchReplace);

const queryTarget = `supabase.from('staff').select('*, profile:profiles!profile_id(*)').eq('salon_id', salon.id)
        ]);`;
const queryReplace = `supabase.from('staff').select('*, profile:profiles!profile_id(*)').eq('salon_id', salon.id),
          supabase.from('blocked_times').select('*, staff:staff(profile:profiles!profile_id(first_name_ar, first_name_en))').eq('salon_id', salon.id).order('start_datetime', { ascending: false })
        ]);`;
content = content.replace(queryTarget, queryReplace);

const stateTarget = `setStaffList(stfData.data || []);`;
const stateReplace = `setStaffList(stfData.data || []);\n        setBlockedTimes(btData.data || []);`;
content = content.replace(stateTarget, stateReplace);

// 4. Update handleSaveTimeOff
const oldHandleSave = `  const handleSaveTimeOff = async () => {
    if (!timeOffData.date || !salonData) return;
    setIsSavingTimeOff(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        salon_id: salonData.id,
        client_id: user?.id,
        staff_id: timeOffData.staff_id || null,
        booking_date: timeOffData.date,
        booking_time: timeOffData.type === 'full_day' ? '00:00:00' : timeOffData.time,
        total_amount: -1,
        status: 'confirmed'
      });
      if (!error) {
        setShowTimeOffModal(false);
        fetchSalonAndBookings();
        alert(isAr ? 'تم حفظ الإغلاق بنجاح' : 'Time off saved successfully');
      } else {
        alert('Error saving time off');
      }
    } catch(err) {
      console.error(err);
    }
    setIsSavingTimeOff(false);
  };`;

const newHandleSave = `  const handleSaveTimeOff = async () => {
    if (!timeOffData.date || !salonData) return;
    setIsSavingTimeOff(true);
    
    let startStr, endStr;
    if (timeOffData.type === 'full_day') {
       startStr = \`\${timeOffData.date}T00:00:00.000Z\`;
       const endDate = new Date(timeOffData.date);
       endDate.setUTCHours(23, 59, 59, 999);
       endStr = endDate.toISOString();
    } else {
       // Using arbitrary timezone isn't perfect, let's keep it simple: date + time + Z
       startStr = new Date(\`\${timeOffData.date}T\${timeOffData.time}:00\`).toISOString();
       endStr = new Date(\`\${timeOffData.date}T\${timeOffData.end_time}:00\`).toISOString();
    }

    try {
      const { error } = await supabase.from('blocked_times').insert({
        salon_id: salonData.id,
        staff_id: timeOffData.staff_id || null,
        start_datetime: startStr,
        end_datetime: endStr,
        reason: timeOffData.reason || null
      });

      if (!error) {
        setShowTimeOffModal(false);
        fetchSalonAndBookings();
        alert(isAr ? 'تم حفظ الوقت المغلق بنجاح' : 'Blocked time saved successfully');
        setTimeOffData({ date: '', staff_id: '', type: 'full_day', time: '10:00', end_time: '11:00', reason: '' });
      } else {
        alert(isAr ? 'حدث خطأ: ' + error.message : 'Error: ' + error.message);
      }
    } catch(err: any) {
      console.error(err);
      alert(isAr ? 'حدث خطأ غير متوقع' : 'Unexpected error');
    }
    setIsSavingTimeOff(false);
  };

  const handleDeleteBlockedTime = async (id: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الإغلاق؟' : 'Are you sure you want to delete this blocked time?')) return;
    try {
      const { error } = await supabase.from('blocked_times').delete().eq('id', id);
      if (!error) {
        setBlockedTimes(prev => prev.filter(bt => bt.id !== id));
        alert(isAr ? 'تم الحذف بنجاح' : 'Deleted successfully');
      } else {
        alert(isAr ? 'حدث خطأ أثناء الحذف' : 'Error deleting');
      }
    } catch(err) {
      console.error(err);
    }
  };`;

content = content.replace(oldHandleSave, newHandleSave);

// 5. Update Time Off UI modal (add end_time and reason)
const oldSpecificTimeUI = `                  {timeOffData.type === 'specific_time' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5 mt-4">{isAr ? 'الوقت' : 'Time'}</label>
                      <input type="time" step="1800" value={timeOffData.time} onChange={(e) => setTimeOffData({...timeOffData, time: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5" />
                    </motion.div>
                  )}`;

const newSpecificTimeUI = `                  {timeOffData.type === 'specific_time' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'من وقت' : 'Start Time'}</label>
                        <input type="time" step="1800" value={timeOffData.time} onChange={(e) => setTimeOffData({...timeOffData, time: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'إلى وقت' : 'End Time'}</label>
                        <input type="time" step="1800" value={timeOffData.end_time} onChange={(e) => setTimeOffData({...timeOffData, end_time: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5" />
                      </div>
                    </motion.div>
                  )}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'السبب (اختياري)' : 'Reason (Optional)'}</label>
                    <input type="text" value={timeOffData.reason} onChange={(e) => setTimeOffData({...timeOffData, reason: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5" />
                  </div>`;

content = content.replace(oldSpecificTimeUI, newSpecificTimeUI);

// 6. Add NavButton for Blocked Times
const navTarget = `<NavButton icon={Scissors} label={t.services_management} active={activeTab === 'services'} onClick={() => setActiveTab('services')} />`;
const navReplace = `<NavButton icon={Scissors} label={t.services_management} active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
            <NavButton icon={CalendarOff} label={isAr ? 'الأوقات المغلقة' : 'Blocked Times'} active={activeTab === 'blocked'} onClick={() => setActiveTab('blocked')} />`;
content = content.replace(navTarget, navReplace);

// 7. Add Tab Content for Blocked Times
const tabContentTarget = `{activeTab === 'staff' && (`;
const tabContentReplace = `{activeTab === 'blocked' && (
              <section className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-zinc-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <CalendarOff className="w-5 h-5 text-zinc-500" />
                    {isAr ? 'سجل الأوقات المغلقة والإجازات' : 'Blocked Times & Time Off'}
                  </h3>
                  <button onClick={() => setShowTimeOffModal(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors">
                    <PlusCircle className="w-4 h-4" />
                    {isAr ? 'إضافة وقت مغلق' : 'Add Time Off'}
                  </button>
                </div>
                
                {blockedTimes.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    {isAr ? 'لا توجد أوقات مغلقة.' : 'No blocked times found.'}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {blockedTimes.map((bt) => {
                      const startDate = new Date(bt.start_datetime);
                      const endDate = new Date(bt.end_datetime);
                      const isFullDay = startDate.getUTCHours() === 0 && endDate.getUTCHours() === 23;
                      
                      return (
                        <div key={bt.id} className="flex flex-col md:flex-row justify-between md:items-center p-4 border border-zinc-100 rounded-xl bg-zinc-50/50">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-zinc-900">
                                {isFullDay ? startDate.toISOString().split('T')[0] : \`\${startDate.toISOString().split('T')[0]} \${startDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} - \${endDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}\`}
                              </span>
                              {isFullDay && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{isAr ? 'يوم كامل' : 'Full Day'}</span>}
                            </div>
                            <div className="text-sm font-medium text-zinc-500 mb-1">
                              {isAr ? 'الفني:' : 'Artist:'} {bt.staff ? (isAr ? bt.staff.profile?.first_name_ar : bt.staff.profile?.first_name_en) : (isAr ? 'جميع الفنيين (الصالون)' : 'All Artists (Salon)')}
                            </div>
                            {bt.reason && (
                              <div className="text-sm text-zinc-400">
                                {isAr ? 'السبب:' : 'Reason:'} {bt.reason}
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleDeleteBlockedTime(bt.id)} className="mt-3 md:mt-0 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition-colors">
                            {isAr ? 'إلغاء الإغلاق' : 'Unblock'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}
            
            {activeTab === 'staff' && (`
content = content.replace(tabContentTarget, tabContentReplace);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Dashboards update complete");
