const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// 1. Add states
content = content.replace(
  "const [showLogin, setShowLogin] = useState(false);",
  "const [showLogin, setShowLogin] = useState(false);\n  const [showReviewModal, setShowReviewModal] = useState<any>(null);\n  const [rating, setRating] = useState(5);\n  const [reviewComment, setReviewComment] = useState('');\n  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());"
);

// 2. Add submitReview function
const submitReviewFn = `  const submitReview = async () => {
    if (!showReviewModal || !user) return;
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: showReviewModal.id,
        client_id: user.id,
        staff_id: showReviewModal.staff_id,
        rating,
        comment: reviewComment
      });
      if (error) throw error;
      
      showToast(isAr ? 'شكراً لتقييمك!' : 'Thank you for your review!', 'success');
      setReviewedBookings(prev => new Set(prev).add(showReviewModal.id));
      setShowReviewModal(null);
      setRating(5);
      setReviewComment('');
    } catch (err: any) {
      console.error(err);
      showToast(isAr ? 'حدث خطأ: ' + err.message : 'Error: ' + err.message, 'error');
    }
  };`;
  
content = content.replace(
  "const fetchBookedTimes = async () => {",
  submitReviewFn + "\n\n  const fetchBookedTimes = async () => {"
);

// 3. Fetch reviewed bookings on load
const fetchMyBookingsTarget = `        setMyBookings(data || []);`;
const fetchMyBookingsReplace = `        setMyBookings(data || []);
        if (data && data.length > 0) {
           const bookingIds = data.map(b => b.id);
           const { data: revs } = await supabase.from('reviews').select('booking_id').in('booking_id', bookingIds);
           if (revs) {
             setReviewedBookings(new Set(revs.map(r => r.booking_id)));
           }
        }`;
content = content.replace(fetchMyBookingsTarget, fetchMyBookingsReplace);

// 4. Add Rate button to my-bookings item
const btnTarget = `<button 
                        onClick={() => setPreviewBooking(b)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors border border-zinc-200 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isAr ? 'التفاصيل' : 'Details'}
                      </button>`;
const btnReplace = `<button 
                        onClick={() => setPreviewBooking(b)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors border border-zinc-200 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isAr ? 'التفاصيل' : 'Details'}
                      </button>
                      {b.status === 'completed' && !reviewedBookings.has(b.id) && (
                        <button 
                          onClick={() => { setRating(5); setReviewComment(''); setShowReviewModal(b); }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-200 flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {isAr ? 'تقييم' : 'Rate'}
                        </button>
                      )}`;
content = content.replace(btnTarget, btnReplace);

// 5. Add Review Modal UI to overlays
const oldOverlays = `const overlays = (
    <>`;
const reviewModalUI = `
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setShowReviewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="flex justify-between items-center p-6 border-b border-zinc-100">
                <h3 className="text-xl font-bold text-zinc-900">{isAr ? 'تقييم الخدمة' : 'Rate Service'}</h3>
                <button onClick={() => setShowReviewModal(null)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6 text-center">
                <div className="flex justify-center gap-2" dir="ltr">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star className={\`w-8 h-8 \${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-100 text-zinc-200'}\`} />
                    </button>
                  ))}
                </div>
                <div className="text-left" dir={isAr ? 'rtl' : 'ltr'}>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">{isAr ? 'ملاحظاتك (اختياري)' : 'Notes (Optional)'}</label>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none h-24"
                    placeholder={isAr ? 'كيف كانت تجربتك؟' : 'How was your experience?'}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3">
                <button onClick={() => setShowReviewModal(null)} className="flex-1 py-3 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={submitReview} className="flex-1 py-3 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-zinc-900/10">
                  {isAr ? 'إرسال التقييم' : 'Submit Review'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;
content = content.replace(oldOverlays, oldOverlays + reviewModalUI);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Added Review Modal successfully");
