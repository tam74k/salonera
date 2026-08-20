const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(/p_password: newArtistData\.password,/, "p_password: newArtistData.password || '123456',");

fs.writeFileSync('src/screens/Dashboards.tsx', content);
