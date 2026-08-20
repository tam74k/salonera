const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(
  "salonName = isAr ? stf.salons.name_ar : stf.salons.name_en;",
  "const s: any = stf.salons;\n            salonName = isAr ? s.name_ar : s.name_en;"
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Fixed typescript error");
