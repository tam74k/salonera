const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// Ensure artistTab state
if (!content.includes("const [artistTab, setArtistTab] = useState('today');")) {
  content = content.replace("const [activeTab, setActiveTab] = useState('dashboard');",
    "const [activeTab, setActiveTab] = useState('dashboard');\n  const [artistTab, setArtistTab] = useState('today');");
}

// Locate the block inside "if (role === 'artist') {"
const artistStartStr = "  if (role === 'artist') {\n    return (\n      <div className=\"max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24\">\n        <div className=\"bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-8 md:p-12 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-indigo-900/20\">\n          <div className=\"absolute right-0 top-0 opacity-10\">\n            <Scissors className=\"w-64 h-64 -mr-12 -mt-12 text-white\" />";

// We need to cut out the modal which was wrongly injected here.
// Actually, let's just use string splitting.
const parts = content.split("  if (role === 'artist') {");
let beforeArtist = parts[0];
let rest = parts[1];

const adminStartSplit = rest.split("  // Admin / Cashier Dashboard View");
let artistBlock = adminStartSplit[0];
let adminBlock = "  // Admin / Cashier Dashboard View" + adminStartSplit[1];

// Extract the modal from artistBlock
const modalStart = artistBlock.indexOf("{/* Edit Booking Modal */}");
const modalEndMarker = "</AnimatePresence>\n    </div>";
const modalEnd = artistBlock.indexOf(modalEndMarker) + modalEndMarker.length;

let modalStr = "";
if (modalStart !== -1 && modalEnd !== -1) {
    modalStr = artistBlock.substring(modalStart, modalEnd);
    artistBlock = artistBlock.substring(0, modalStart) + "\n          </div>\n" + artistBlock.substring(modalEnd);
}

// Rewrite the artist block completely.
const newArtistBlock = `
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
                      return b.booking_date === todayStr && b.status === 'confirmed';
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
                    </div>
                  </motion.div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    );
  }
`;

// Now reassemble
let newContent = beforeArtist + "  if (role === 'artist') {" + newArtistBlock + "\n" + adminBlock;

// Append modal at the end of Dashboards return statement
if (modalStr && !newContent.includes("{/* Edit Booking Modal */}")) {
   // The Dashboard component returns a large div. The last lines are:
   //   // ... admin block
   //    </div>
   //  );
   // }
   const returnEnd = newContent.lastIndexOf("    </div>\n  );\n}");
   if (returnEnd !== -1) {
       newContent = newContent.substring(0, returnEnd) + "\n" + modalStr + "\n    </div>\n  );\n}" + newContent.substring(returnEnd + 15);
   }
}

fs.writeFileSync('src/screens/Dashboards.tsx', newContent);
console.log("Dashboards fixed successfully");
