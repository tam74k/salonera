const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const anchorStart = "{artistBookings.length === 0 ? (";
const anchorEnd = "                </motion.div>\n              ))\n            }"; // Note: I should be careful about the exact ending
const startIndex = content.indexOf(anchorStart);
const endIndexStr = "</motion.div>\n              ))}";
const endIndex = content.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const newArtistBookingsLogic = `{(() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const todayArtistBookings = artistBookings
                .filter(b => b.booking_date === todayStr && (b.status === 'pending' || b.status === 'confirmed'))
                .sort((a, b) => {
                  const dateA = new Date(\`\${a.booking_date}T\${a.booking_time}\`).getTime();
                  const dateB = new Date(\`\${b.booking_date}T\${b.booking_time}\`).getTime();
                  return dateA - dateB;
                });
              
              if (todayArtistBookings.length === 0) {
                return (
                  <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-100">
                    {isAr ? 'لا يوجد لديك مواعيد حتى الآن.' : 'You have no appointments yet.'}
                  </div>
                );
              }

              return todayArtistBookings.map((b, i) => (
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
                        {isAr ? 'إنهاء الخدمة (Completed)' : 'Mark Completed'}
                      </button>
                    )}
                  </div>
                </motion.div>
              ));
            })()}`;

    content = content.slice(0, startIndex) + newArtistBookingsLogic + content.slice(endIndex + endIndexStr.length);
    fs.writeFileSync('src/screens/Dashboards.tsx', content);
} else {
    console.log('Could not find boundaries');
}

// Also update the upcoming appointments text:
const upcomingTextRegex = /artistBookings\.filter\(b => b\.status === 'pending' \|\| b\.status === 'confirmed'\)\.length/g;
const upcomingReplacement = "artistBookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0] && (b.status === 'pending' || b.status === 'confirmed')).length";
content = content.replace(upcomingTextRegex, upcomingReplacement);

fs.writeFileSync('src/screens/Dashboards.tsx', content);

