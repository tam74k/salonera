const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// Remove bookings button from sidebar
content = content.replace(
  `<NavButton icon={Calendar} label={t.my_bookings} active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />`,
  ``
);

// Remove the old Bookings Tab UI just in case it takes up space, but it's okay if left as dead code or if it was removed in a previous turn (it wasn't).
const oldBookingsTabStart = `{activeTab === 'bookings' && (`;
const idxStart = content.indexOf(oldBookingsTabStart);
if (idxStart !== -1) {
  const nextTabStart = `{activeTab === 'services' && (`;
  const idxEnd = content.indexOf(nextTabStart);
  if (idxEnd !== -1) {
    content = content.substring(0, idxStart) + content.substring(idxEnd);
  }
}

fs.writeFileSync('src/screens/Dashboards.tsx', content);
