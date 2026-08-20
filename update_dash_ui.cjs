const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// 1. Add X icon
content = content.replace("import { CheckCircle2, Image as ImageIcon", "import { X, CheckCircle2, Image as ImageIcon");

// 2. Fix the Artist Booking Card (make it clickable)
const oldArtistCard = `<motion.div 
                    key={b.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-5 md:p-6 rounded-[24px] border border-zinc-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div>`;

const newArtistCard = `<motion.div 
                    key={b.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-5 md:p-6 rounded-[24px] border border-zinc-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer"
                    onClick={() => { setSelectedBookingForEdit(b); setShowBookingEditModal(true); }}
                  >
                    <div>`;
content = content.replace(oldArtistCard, newArtistCard);

// 3. Prevent propagation on the "Mark Arrived" button in Artist Card
const oldMarkArrived = `onClick={() => updateBookingStatus(b.id, 'completed', true)}`;
const newMarkArrived = `onClick={(e) => { e.stopPropagation(); updateBookingStatus(b.id, 'completed', true); }}`;
content = content.replace(oldMarkArrived, newMarkArrived);

// 4. Update the Admin/Cashier Booking Card
const oldAdminCardStart = `key={b.id} className="p-4 md:p-6 border border-zinc-100 rounded-[16px] bg-zinc-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">`;

const newAdminCardStart = `key={b.id} 
              className="p-4 md:p-6 border border-zinc-100 rounded-[16px] bg-white shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              onClick={() => { setSelectedBookingForEdit(b); setShowBookingEditModal(true); }}
            >
              <div className="flex items-center gap-4">`;
content = content.replace(oldAdminCardStart, newAdminCardStart);

// Prevent propagation on select
const oldSelect = `onChange={(e) => updateBookingStatus(b.id, e.target.value)}`;
const newSelect = `onClick={(e) => e.stopPropagation()} onChange={(e) => updateBookingStatus(b.id, e.target.value)}`;
content = content.replace(oldSelect, newSelect);


// 5. Inject the Modal before </main>
const modalCode = `
        {/* Booking Details Modal */}
        <AnimatePresence>
          {showBookingEditModal && selectedBookingForEdit && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
              onClick={() => setShowBookingEditModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <h2 className="text-xl font-bold text-zinc-900">
                    {isAr ? 'تفاصيل الحجز' : 'Booking Details'} #{selectedBookingForEdit.id.substring(0, 6)}
                  </h2>
                  <button onClick={() => setShowBookingEditModal(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <p className="text-sm text-zinc-500 mb-1">{isAr ? 'العميل' : 'Client'}</p>
                      <p className="font-bold text-zinc-900 text-lg">
                        {isAr ? (selectedBookingForEdit.client?.first_name_ar || selectedBookingForEdit.client?.first_name_en) : (selectedBookingForEdit.client?.first_name_en || selectedBookingForEdit.client?.first_name_ar)}
                      </p>
                      <p className="text-sm text-zinc-600 mt-1">{selectedBookingForEdit.client?.mobile}</p>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <p className="text-sm text-zinc-500 mb-1">{isAr ? 'الموظف (الفني)' : 'Staff (Artist)'}</p>
                      <p className="font-bold text-zinc-900 text-lg">
                        {isAr ? (selectedBookingForEdit.artist?.first_name_ar || selectedBookingForEdit.artist?.first_name_en) : (selectedBookingForEdit.artist?.first_name_en || selectedBookingForEdit.artist?.first_name_ar)}
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={selectedBookingForEdit.status} isAr={isAr} />
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4">{isAr ? 'تاريخ ووقت الحجز' : 'Date & Time'}</h3>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-white border border-zinc-200 p-3 rounded-xl flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-zinc-400" />
                        <span className="font-medium text-zinc-900">{selectedBookingForEdit.booking_date}</span>
                      </div>
                      <div className="flex-1 bg-white border border-zinc-200 p-3 rounded-xl flex items-center gap-3">
                        <Clock className="w-5 h-5 text-zinc-400" />
                        <span className="font-medium text-zinc-900">{selectedBookingForEdit.booking_time}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-4">{isAr ? 'الخدمات المطلوبة' : 'Requested Services'}</h3>
                    <div className="space-y-3">
                      {selectedBookingForEdit.details?.map((d: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                          <div>
                            <p className="font-bold text-zinc-900">{isAr ? d.services?.name_ar : d.services?.name_en}</p>
                            <p className="text-sm text-zinc-500">{d.services?.duration} {isAr ? 'دقيقة' : 'min'}</p>
                          </div>
                          {role !== 'artist' && (
                            <div className="text-right">
                              <p className="font-bold text-zinc-900">{d.price} {isAr ? 'ر.س' : 'SAR'}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {role !== 'artist' && (
                      <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center">
                        <p className="text-lg font-bold text-zinc-900">{isAr ? 'الإجمالي' : 'Total'}</p>
                        <p className="text-2xl font-extrabold text-zinc-900">
                          {selectedBookingForEdit.total_price} {isAr ? 'ر.س' : 'SAR'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
                  <button 
                    onClick={() => setShowBookingEditModal(false)}
                    className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                  >
                    {isAr ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>`;

content = content.replace("</main>", modalCode);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Updated dashboards with modal.");
