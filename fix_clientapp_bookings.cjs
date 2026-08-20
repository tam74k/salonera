const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

content = content.replace("type BookingStep = 'salons' | 'services' | 'datetime' | 'confirmed';", 
  "type BookingStep = 'salons' | 'services' | 'datetime' | 'confirmed' | 'my-bookings';");

content = content.replace("const [bookedTimes, setBookedTimes] = useState<string[]>([]);", 
  "const [bookedTimes, setBookedTimes] = useState<string[]>([]);\n  const [myBookings, setMyBookings] = useState<any[]>([]);\n  const [reviewRating, setReviewRating] = useState(5);\n  const [reviewComment, setReviewComment] = useState('');");

// We need a function to fetch my bookings.
const fetchMyBookingsFunc = `
  const fetchMyBookings = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('bookings').select(\`
        *,
        salon:salons(name_ar, name_en),
        staff:staff!staff_id(profile:profiles!profile_id(first_name_ar, first_name_en)),
        details:booking_details(services(name_ar, name_en))
      \`).eq('client_id', user.id).order('booking_date', { ascending: false }).order('booking_time', { ascending: false });
      setMyBookings(data || []);
    } catch(err) {
      console.error(err);
    }
  };
`;

content = content.replace("  const handleSalonSelect = (salon: any) => {", fetchMyBookingsFunc + "\n  const handleSalonSelect = (salon: any) => {");

// We need to add a button in the UI to open "My Bookings". Let's put it next to Logout.
const logoutStr = `<button onClick={onLogout} className="text-slate-500 hover:text-rose-600 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>`;
const newBtns = `<button onClick={() => { fetchMyBookings(); setStep('my-bookings'); }} className="text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1 bg-slate-100 rounded-lg text-sm font-bold flex items-center gap-1">
            {isAr ? 'حجوزاتي' : 'My Bookings'}
          </button>
          <button onClick={onLogout} className="text-slate-500 hover:text-rose-600 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>`;

content = content.replace(logoutStr, newBtns);

// Add the my-bookings tab view right before confirmed step or something
const myBookingsUI = `
        {step === 'my-bookings' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between mb-8">
               <button onClick={() => setStep('salons')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
                 <ArrowLeft className="w-5 h-5" /> {isAr ? 'العودة' : 'Back'}
               </button>
               <h2 className="text-3xl font-bold text-slate-900">{isAr ? 'حجوزاتي' : 'My Bookings'}</h2>
            </div>
            
            <div className="space-y-4">
               {myBookings.length === 0 ? (
                 <p className="text-slate-500 text-center py-8">{isAr ? 'لا يوجد حجوزات سابقة' : 'No bookings found'}</p>
               ) : myBookings.map((b: any) => {
                 const isCompleted = b.status === 'completed';
                 const isCancelable = b.status === 'pending' || b.status === 'confirmed';
                 const bDate = new Date(\`\${b.booking_date}T\${b.booking_time}\`);
                 const now = new Date();
                 const diffHours = (now.getTime() - bDate.getTime()) / (1000 * 60 * 60);
                 const canReview = isCompleted && diffHours <= 24 && diffHours >= 0;
                 const staffName = b.staff?.profile ? (isAr ? b.staff.profile.first_name_ar : b.staff.profile.first_name_en) : (isAr ? 'أي موظف' : 'Any Staff');

                 return (
                   <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                     <div className="flex justify-between items-start">
                       <div>
                         <h3 className="font-bold text-lg text-slate-900">{isAr ? b.salon?.name_ar : b.salon?.name_en}</h3>
                         <p className="text-slate-500 text-sm">{b.booking_date} • {b.booking_time} | {staffName}</p>
                       </div>
                       <span className={\`px-3 py-1 text-xs font-bold rounded-lg \${b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : b.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}\`}>
                         {b.status}
                       </span>
                     </div>
                     <div className="flex flex-wrap gap-2 text-xs">
                        {b.details?.map((d: any, idx: number) => (
                           <span key={idx} className="bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-medium">
                             {isAr ? d.services?.name_ar : d.services?.name_en}
                           </span>
                        ))}
                     </div>
                     
                     <div className="flex gap-2 mt-2 pt-4 border-t border-slate-50">
                        {isCancelable && (
                           <button onClick={async () => {
                              if (confirm(isAr ? 'هل أنت متأكد من إلغاء الحجز؟' : 'Are you sure you want to cancel?')) {
                                 await supabase.from('bookings').update({status: 'cancelled'}).eq('id', b.id);
                                 fetchMyBookings();
                              }
                           }} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors">
                             {isAr ? 'إلغاء الحجز' : 'Cancel'}
                           </button>
                        )}
                        {canReview && (
                           <button onClick={async () => {
                              const ratingStr = prompt(isAr ? 'تقييمك (من 1 إلى 5):' : 'Rating (1-5):', '5');
                              if (!ratingStr) return;
                              const rating = parseInt(ratingStr);
                              const comment = prompt(isAr ? 'تعليقك (اختياري):' : 'Comment (Optional):') || '';
                              
                              if (rating >= 1 && rating <= 5) {
                                 const { error } = await supabase.from('reviews').insert({
                                    booking_id: b.id,
                                    client_id: user?.id,
                                    staff_id: b.staff_id,
                                    rating,
                                    comment
                                 });
                                 if (error) {
                                    alert(isAr ? 'حدث خطأ: ' + error.message : 'Error: ' + error.message);
                                 } else {
                                    alert(isAr ? 'شكراً لتقييمك!' : 'Thanks for your review!');
                                 }
                              } else {
                                 alert(isAr ? 'التقييم يجب أن يكون بين 1 و 5' : 'Rating must be between 1 and 5');
                              }
                           }} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1">
                             <Star className="w-4 h-4" /> {isAr ? 'تقييم التجربة' : 'Review'}
                           </button>
                        )}
                     </div>
                   </div>
                 );
               })}
            </div>
          </motion.div>
        )}
`;

content = content.replace("{step === 'confirmed' && (", myBookingsUI + "\n        {step === 'confirmed' && (");

content = content.replace("import { Search, MapPin, Calendar, Clock, ArrowLeft, CheckCircle2, ChevronRight, Check, MapPin as MapPinIcon, Navigation, Info, Star, X, LogOut, Loader2 } from 'lucide-react';",
"import { Search, MapPin, Calendar, Clock, ArrowLeft, CheckCircle2, ChevronRight, Check, MapPin as MapPinIcon, Navigation, Info, Star, X, LogOut, Loader2 } from 'lucide-react';"); // Already has star

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("ClientApp.tsx updated with My Bookings");
