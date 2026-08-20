const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const oldStr = `    if (!error) {
      alert(isAr ? 'تم الحفظ بنجاح' : 'Saved successfully');
      fetchSalonAndBookings();
    } else {`;

const newStr = `    if (!error) {
      alert(isAr ? 'تم الحفظ بنجاح' : 'Saved successfully');
      fetchSalonAndBookings();
      setActiveTab('dashboard');
    } else {`;

content = content.replace(oldStr, newStr);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Updated handleSaveSettings to set active tab to dashboard");
