const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(
  /if \(!newArtistData\.email \|\| !salonData\) return;/,
  'if (!newArtistData.email || !salonData) {\n      alert("Please enter the email for the new artist");\n      return;\n    }'
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
