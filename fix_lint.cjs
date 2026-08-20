const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// Fix handleUpdateBookingStatus
content = content.replace(/handleUpdateBookingStatus\(/g, "updateBookingStatus(");

// Fix ImageIcon
if (!content.includes('ImageIcon')) {
    content = content.replace(/import { (.*?) } from 'lucide-react';/, "import { $1, ImageIcon } from 'lucide-react';");
}

fs.writeFileSync('src/screens/Dashboards.tsx', content);

// Fix App.tsx key property on Auth component
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(/<Auth key="auth" onLogin=/g, '<Auth onLogin=');
fs.writeFileSync('src/App.tsx', appContent);

