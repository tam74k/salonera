const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// Fix the messed up line 68
content = content.replace(
  /working_hours_start: '09:00', working_hours_end: '22:00', images: \[\], salon_type: 'both',\n             country: 'SA',\n             currency: 'SAR',/g,
  "working_hours_start: '09:00', working_hours_end: '22:00', images: [], salon_type: 'both',"
);

// Fix the insert block
content = content.replace(
  /name_en: 'My Salon',\n             type: 'both'\n          \}\)/g,
  "name_en: 'My Salon',\n             type: 'both',\n             country: 'SA',\n             currency: 'SAR'\n          })"
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Fixed Dashboards.tsx");
