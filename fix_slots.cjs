const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

content = content.replace(
  "selectedSalon.open_time || '09:00',",
  "selectedSalon.working_hours_start || selectedSalon.open_time || '09:00',"
);

content = content.replace(
  "selectedSalon.close_time || '22:00',",
  "selectedSalon.working_hours_end || selectedSalon.close_time || '22:00',"
);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
