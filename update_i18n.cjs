const fs = require('fs');
let content = fs.readFileSync('src/i18n.ts', 'utf8');

content = content.replace("whatsapp_api_settings: 'إعدادات واتساب API',", "whatsapp_api_settings: 'إعدادات الصالون',");
content = content.replace("whatsapp_api_settings: 'WhatsApp API Settings',", "whatsapp_api_settings: 'Salon Settings',");

fs.writeFileSync('src/i18n.ts', content);
