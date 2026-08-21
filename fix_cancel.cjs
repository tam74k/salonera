const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// Replace all occurrences of 'cancelled' with 'canceled' where it refers to the status
content = content.replace(/status: 'cancelled'/g, "status: 'canceled'");
content = content.replace(/status === 'cancelled'/g, "status === 'canceled'");
content = content.replace(/bookingFilter === 'cancelled'/g, "bookingFilter === 'canceled'");
content = content.replace(/setBookingFilter\('cancelled'\)/g, "setBookingFilter('canceled')");
content = content.replace(/<button onClick=\{\(\) => setBookingFilter\('canceled'\)\} className=\{`flex-1 py-2 text-sm font-bold rounded-lg transition-colors \$\{bookingFilter === 'canceled' \? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'\}`\}>\n\s*\{isAr \? 'الملغية' : 'Cancelled'\}\n\s*<\/button>/g, 
  `<button onClick={() => setBookingFilter('canceled')} className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-colors \${bookingFilter === 'canceled' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}\`}>\n            {isAr ? 'الملغية' : 'Canceled'}\n          </button>`);

// Also fix the UI text representation if needed
content = content.replace(/b.status === 'canceled' \? 'Cancelled'/g, "b.status === 'canceled' ? 'Canceled'");

fs.writeFileSync('src/screens/ClientApp.tsx', content);
