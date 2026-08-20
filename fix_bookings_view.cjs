const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// 1. Add bookingViewTab state
const hooksStart = "const [searchQuery, setSearchQuery] = useState('');";
const newHooks = `const [searchQuery, setSearchQuery] = useState('');
  const [bookingViewTab, setBookingViewTab] = useState<'active'|'archive'>('active');`;

content = content.replace(hooksStart, newHooks);

// 2. Identify the bookings list render and replace it
const targetStart = `<h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    {isAr ? 'قائمة الحجوزات' : 'Bookings List'}
                  </h3>`;

const searchInputOld = `<input 
                      type="text" 
                      placeholder={isAr ? 'بحث بالاسم، الجوال، كود الحجز' : 'Search by name, mobile, code'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    />`;

const dateInputOld = `<input 
                      type="date" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />`;

// Process bookings logic:
const newBookingsLogic = `
{(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Process Active vs Archive
    const processedBookings = bookings.filter(b => {
      if (bookingViewTab === 'active') {
        if (b.status === 'completed' || b.status === 'cancelled') return false;
        if (!searchQuery && b.booking_date !== todayStr) return false;
      } else {
        if (b.status === 'pending' || b.status === 'confirmed') return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          b.client.first_name_en?.toLowerCase().includes(q) || 
          b.client.first_name_ar?.toLowerCase().includes(q) || 
          b.client.mobile?.includes(q) ||
          b.id.includes(q) ||
          b.booking_date.includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(\`\${a.booking_date}T\${a.booking_time}\`).getTime();
      const dateB = new Date(\`\${b.booking_date}T\${b.booking_time}\`).getTime();
      return bookingViewTab === 'active' ? dateA - dateB : dateB - dateA;
    });

    return (
      <>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            {isAr ? 'قائمة الحجوزات' : 'Bookings List'}
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => { setBookingViewTab('active'); setSearchQuery(''); }}
              className={\`px-6 py-2 rounded-lg text-sm font-bold transition-all \${bookingViewTab === 'active' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              {isAr ? 'النشطة (اليوم)' : 'Active (Today)'}
            </button>
            <button 
              onClick={() => { setBookingViewTab('archive'); setSearchQuery(''); }}
              className={\`px-6 py-2 rounded-lg text-sm font-bold transition-all \${bookingViewTab === 'archive' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              {isAr ? 'الأرشيف' : 'Archive'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input 
            type="text" 
            placeholder={isAr ? 'بحث بالاسم، الجوال، كود الحجز' : 'Search by name, mobile, code'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input 
            type="date" 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors" onClick={() => {
              const code = prompt(isAr ? 'أدخل كود الحجز من الـ QR' : 'Enter QR Booking Code');
              if(code) setSearchQuery(code);
          }}>
            <XCircle className="w-4 h-4 hidden" /> 
            {isAr ? 'مسح QR / كود' : 'Scan QR / Code'}
          </button>
        </div>

        <div className="space-y-4">
          {processedBookings.length === 0 ? (
            <p className="text-slate-500 text-center py-8">{bookingViewTab === 'active' ? (isAr ? 'لا يوجد حجوزات نشطة اليوم' : 'No active bookings today') : (isAr ? 'لا يوجد حجوزات في الأرشيف' : 'No bookings in archive')}</p>
          ) : processedBookings.map((b, i) => (
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
                  onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
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
        </div>
      </>
    );
  })()}
`;

const replaceRegex = /<h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">[\s\S]*?(?=<\/section>)/;
content = content.replace(replaceRegex, newBookingsLogic);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
