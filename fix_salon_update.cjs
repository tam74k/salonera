const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(
  "salon_type: salonSettingsData.salon_type,",
  "type: salonSettingsData.salon_type,"
);

content = content.replace(
  /if \(!error\) \{\n\s*alert\(isAr \? 'تم الحفظ بنجاح' : 'Saved successfully'\);\n\s*\}/,
  `if (!error) {
      alert(isAr ? 'تم الحفظ بنجاح' : 'Saved successfully');
    } else {
      console.error("Save error:", error);
      alert((isAr ? 'حدث خطأ أثناء الحفظ: ' : 'Error saving: ') + error.message);
    }`
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Fixed salon_type issue and added error reporting");
