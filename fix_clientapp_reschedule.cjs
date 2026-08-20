const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const stateStr = `const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');`;

const newStateStr = `const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleAvailableTimes, setRescheduleAvailableTimes] = useState<string[]>([]);
  const [rescheduleBookedTimes, setRescheduleBookedTimes] = useState<string[]>([]);
  const [isRescheduling, setIsRescheduling] = useState(false);`;

content = content.replace(stateStr, newStateStr);


const fetchRescheduleTimesStr = `
  const fetchRescheduleTimes = async (date: string, salonId: string, staffId: string | null) => {
    setRescheduleDate(date);
    setRescheduleTime('');
    try {
      const { data } = await supabase.from('bookings')
        .select('booking_time')
        .eq('booking_date', date)
        .eq('salon_id', salonId)
        .neq('status', 'canceled');
      
      let filtered = data || [];
      if (staffId) {
        const { data: staffBookings } = await supabase.from('bookings')
          .select('booking_time')
          .eq('booking_date', date)
          .eq('staff_id', staffId)
          .neq('status', 'canceled');
        filtered = staffBookings || [];
      }
      
      const formattedTimes = filtered.map(b => b.booking_time.substring(0, 5));
      setRescheduleBookedTimes(formattedTimes);
      
      // Generate available times (simplified 9 to 21)
      const times = [];
      for(let h=9; h<=21; h++) {
         const hh = h.toString().padStart(2, '0');
         times.push(\`\${hh}:00\`);
         times.push(\`\${hh}:30\`);
      }
      setRescheduleAvailableTimes(times);
      
    } catch(err) {
      console.error(err);
    }
  };
`;

content = content.replace("  const fetchMyBookings = async () => {", fetchRescheduleTimesStr + "\n  const fetchMyBookings = async () => {");


const rescheduleBtnStr = `                        {isCancelable && (
                           <button onClick={async () => {
                              if (confirm(isAr ? 'هل أنت متأكد من إلغاء الحجز؟' : 'Are you sure you want to cancel?')) {
                                 await supabase.from('bookings').update({status: 'cancelled'}).eq('id', b.id);
                                 fetchMyBookings();
                              }
                           }} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors">
                             {isAr ? 'إلغاء الحجز' : 'Cancel'}
                           </button>
                        )}`;

const newBtnsStr = `                        {isCancelable && (
                           <>
                             <button onClick={async () => {
                                if (confirm(isAr ? 'هل أنت متأكد من إلغاء الحجز؟' : 'Are you sure you want to cancel?')) {
                                   await supabase.from('bookings').update({status: 'cancelled'}).eq('id', b.id);
                                   fetchMyBookings();
                                }
                             }} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors">
                               {isAr ? 'إلغاء الحجز' : 'Cancel'}
                             </button>
                             <button onClick={() => {
                                setRescheduleBooking(b);
                                fetchRescheduleTimes(new Date().toISOString().split('T')[0], b.salon_id, b.staff_id);
                             }} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                               {isAr ? 'تعديل الموعد' : 'Reschedule'}
                             </button>
                           </>
                        )}`;

content = content.replace(rescheduleBtnStr, newBtnsStr);

const modalStr = `
            </div>
          </motion.div>
        )}
`;
const newModalStr = `
            </div>
            
            <AnimatePresence>
               {rescheduleBooking && (
                  <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-end md:items-center p-4">
                     <motion.div initial={{y: 50}} animate={{y: 0}} exit={{y: 50}} className="bg-white p-6 rounded-3xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="text-xl font-bold">{isAr ? 'تعديل الموعد' : 'Reschedule Booking'}</h3>
                           <button onClick={() => setRescheduleBooking(null)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'التاريخ الجديد' : 'New Date'}</label>
                              <input 
                                 type="date"
                                 min={new Date().toISOString().split('T')[0]}
                                 value={rescheduleDate}
                                 onChange={(e) => fetchRescheduleTimes(e.target.value, rescheduleBooking.salon_id, rescheduleBooking.staff_id)}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                              />
                           </div>
                           
                           {rescheduleDate && (
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'الوقت الجديد' : 'New Time'}</label>
                                 <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                                    {rescheduleAvailableTimes.map(t => {
                                       const isBooked = rescheduleBookedTimes.includes(t) || (rescheduleDate === rescheduleBooking.booking_date && t === rescheduleBooking.booking_time.substring(0, 5));
                                       return (
                                          <button 
                                             key={t}
                                             disabled={isBooked}
                                             onClick={() => setRescheduleTime(t)}
                                             className={\`py-2 rounded-lg text-sm font-bold transition-colors \${
                                                isBooked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                                                rescheduleTime === t ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-200 hover:border-indigo-600'
                                             }\`}
                                          >
                                             {t}
                                          </button>
                                       )
                                    })}
                                 </div>
                              </div>
                           )}
                           
                           <button 
                              disabled={!rescheduleTime || isRescheduling}
                              onClick={async () => {
                                 setIsRescheduling(true);
                                 try {
                                    const { error } = await supabase.from('bookings').update({
                                       booking_date: rescheduleDate,
                                       booking_time: rescheduleTime
                                    }).eq('id', rescheduleBooking.id);
                                    if(error) throw error;
                                    setRescheduleBooking(null);
                                    fetchMyBookings();
                                    alert(isAr ? 'تم تعديل الموعد بنجاح' : 'Rescheduled successfully');
                                 } catch(err: any) {
                                    alert(isAr ? 'حدث خطأ: ' + err.message : 'Error: ' + err.message);
                                 } finally {
                                    setIsRescheduling(false);
                                 }
                              }}
                              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-4 disabled:bg-slate-400"
                           >
                              {isRescheduling ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isAr ? 'تأكيد الموعد' : 'Confirm')}
                           </button>
                        </div>
                     </motion.div>
                  </motion.div>
               )}
            </AnimatePresence>
          </motion.div>
        )}
`;

content = content.replace(modalStr, newModalStr);


// Check if AnimatePresence is imported
if (!content.includes('AnimatePresence')) {
  content = content.replace("import { motion } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");
} else if (!content.match(/import \{[^}]*AnimatePresence[^}]*\} from 'motion\/react'/)) {
  content = content.replace("import { motion } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");
}


fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("ClientApp.tsx updated with reschedule");
