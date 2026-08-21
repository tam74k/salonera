const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

if (!content.includes('Eye,')) {
    content = content.replace("User as UserIcon, Loader2, Lock, Save }", "User as UserIcon, Loader2, Lock, Save, Eye, X }");
}

if (!content.includes('previewBooking')) {
    content = content.replace(
        "const [myBookings, setMyBookings] = useState<any[]>([]);",
        "const [myBookings, setMyBookings] = useState<any[]>([]);\n  const [previewBooking, setPreviewBooking] = useState<any>(null);"
    );
}

// update the cancel condition
content = content.replace(
    "const canCancel = (b.status === 'pending' || b.status === 'confirmed') && hoursDiff >= 24;",
    "const canCancel = (b.status === 'pending' || b.status === 'confirmed'); // Allow cancellation for pending/confirmed"
);

const oldCardButtons = `                    {canCancel && (
                      <button 
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100 mt-2 md:mt-0"
                      >
                        {isAr ? 'إلغاء الحجز' : 'Cancel Booking'}
                      </button>
                    )}`;

const newCardButtons = `                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <button 
                        onClick={() => setPreviewBooking(b)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors border border-zinc-200 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isAr ? 'التفاصيل' : 'Details'}
                      </button>
                      {canCancel && (
                        <button 
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100"
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                      )}
                    </div>`;

content = content.replace(oldCardButtons, newCardButtons);

// Modal UI injection
const modalTarget = `      {/* Global Toast Notification */}`;
const modalUI = `
      {/* Preview Modal */}
      <AnimatePresence>
        {previewBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="font-bold text-xl text-zinc-900">{isAr ? 'تفاصيل الحجز' : 'Booking Details'}</h3>
                <button onClick={() => setPreviewBooking(null)} className="p-2 bg-zinc-50 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-zinc-500 text-sm font-medium mb-1">{isAr ? 'الصالون' : 'Salon'}</h4>
                  <p className="font-bold text-zinc-900 text-lg">{isAr ? previewBooking.salon?.name_ar : previewBooking.salon?.name_en}</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-zinc-500 text-sm font-medium mb-1">{isAr ? 'التاريخ' : 'Date'}</h4>
                    <p className="font-bold text-zinc-900">{previewBooking.booking_date}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-zinc-500 text-sm font-medium mb-1">{isAr ? 'الوقت' : 'Time'}</h4>
                    <p className="font-bold text-zinc-900">{previewBooking.booking_time?.substring(0,5)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-zinc-500 text-sm font-medium mb-2">{isAr ? 'الخدمات' : 'Services'}</h4>
                  <div className="space-y-2">
                    {previewBooking.details?.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                        <span className="font-medium text-zinc-900">{isAr ? d.services?.name_ar : d.services?.name_en}</span>
                        <span className="text-sm font-bold text-zinc-900">{currSymbol} {d.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                  <span className="text-zinc-500 font-medium">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-2xl font-bold text-zinc-900">{currSymbol} {previewBooking.total_amount}</span>
                </div>
                <div className="flex justify-center pt-2">
                  <QRCodeSVG value={previewBooking.id} size={100} level="M" />
                </div>
                
                {(previewBooking.status === 'pending' || previewBooking.status === 'confirmed') && (
                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        handleCancelBooking(previewBooking.id);
                        setPreviewBooking(null);
                      }}
                      className="w-full py-3.5 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors border border-rose-100"
                    >
                      {isAr ? 'إلغاء الحجز' : 'Cancel Booking'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global Toast Notification */}`;

content = content.replace(modalTarget, modalUI);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Success ClientApp update");
