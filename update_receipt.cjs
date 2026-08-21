const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// Update disabled slot class
const oldDisabledClass = `'bg-slate-200 text-zinc-400 cursor-not-allowed line-through'`;
const newDisabledClass = `'opacity-50 cursor-not-allowed bg-zinc-100 text-zinc-400'`;
content = content.replace(oldDisabledClass, newDisabledClass);

// Booking ID (split('-')[0])
const oldBookingId = `<span className="font-bold text-zinc-900">{bookingConfirmed}</span>`;
const newBookingId = `<span className="font-bold text-zinc-900 uppercase">{bookingConfirmed.split('-')[0]}</span>`;
content = content.replace(oldBookingId, newBookingId);

// QR Code value to ID (should it still be the full UUID? Yes, full UUID for scanning)
// QR code uses `value={bookingConfirmed}`, which is correct.

// Services list
const servicesCountDiv = `<div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">{isAr ? 'عدد الخدمات' : 'Services Count'}</span>
              <span className="font-bold text-zinc-900">{selectedServices.length}</span>
            </div>`;
const newServicesDiv = `<div className="flex flex-col mb-4 pb-4 border-b border-zinc-200 gap-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">{isAr ? 'الخدمات المحجوزة' : 'Booked Services'}</span>
                <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded-md">{selectedServices.length}</span>
              </div>
              <div className="space-y-1 mt-1">
                {selectedServices.map(srvId => {
                  const srv = services.find(s => s.id === srvId);
                  return srv ? (
                    <div key={srvId} className="flex justify-between text-sm">
                      <span className="font-semibold text-zinc-800">{isAr ? srv.name_ar : srv.name_en}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>`;

content = content.replace(servicesCountDiv, newServicesDiv);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Updated receipt UI");
