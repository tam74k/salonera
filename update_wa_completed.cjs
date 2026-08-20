const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const oldBlock = `        if (status === 'confirmed') {
          message = isAr 
            ? \`مرحباً \${clientName}،\\nتم تأكيد حجزك رقم \${bookingId} بنجاح.\\nننتظرك في الموعد!\` 
            : \`Hello \${clientName},\\nYour booking #\${bookingId} has been confirmed.\\nSee you soon!\`;
        } else if (status === 'canceled') {
          message = isAr 
            ? \`مرحباً \${clientName}،\\nنعتذر منك، تم إلغاء حجزك رقم \${bookingId}.\`
            : \`Hello \${clientName},\\nWe're sorry, your booking #\${bookingId} has been canceled.\`;
        }`;

const newBlock = `        if (status === 'confirmed') {
          message = isAr 
            ? \`مرحباً \${clientName}،\\nتم تأكيد حجزك رقم \${bookingId} بنجاح.\\nننتظرك في الموعد!\` 
            : \`Hello \${clientName},\\nYour booking #\${bookingId} has been confirmed.\\nSee you soon!\`;
        } else if (status === 'canceled') {
          message = isAr 
            ? \`مرحباً \${clientName}،\\nنعتذر منك، تم إلغاء حجزك رقم \${bookingId}.\`
            : \`Hello \${clientName},\\nWe're sorry, your booking #\${bookingId} has been canceled.\`;
        } else if (status === 'completed') {
          message = isAr
            ? \`مرحباً \${clientName}،\\nلقد تم تأكيد وصولك للصالون.\\nنتمنى لك تجربة رائعة معنا!\`
            : \`Hello \${clientName},\\nYour arrival has been confirmed.\\nWe hope you have a great experience with us!\`;
        }`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Updated WhatsApp messages");
