const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

content = content.replace(/if \(step === 'confirmed'\$3\) \{/g, "if (step === 'confirmed' && bookingConfirmed) {");
content = content.replace(/if \(step === 'datetime'\$3\) \{/g, "if (step === 'datetime' && selectedSalon) {");
content = content.replace(/if \(step === 'salon-details'\$3\) \{/g, "if (step === 'salon-details' && selectedSalon) {");
content = content.replace(/if \(step === 'services'\$3\) \{/g, "if (step === 'services' && selectedSalon) {");
content = content.replace(/if \(step === 'profile'\$3\) \{/g, "if (step === 'profile') {");
content = content.replace(/if \(step === 'my-bookings'\$3\) \{/g, "if (step === 'my-bookings') {");

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log('Fixed syntax error');
