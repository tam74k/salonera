const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');
if (!content.includes('AlertCircle')) {
  // Nevermind, it DOES include AlertCircle inside the JSX I just added.
}
// Add import
content = content.replace(
  "import { LayoutDashboard, Users, Scissors, MessageSquare, PlusCircle, Calendar, ArrowRight, ArrowLeft, MoreVertical, Check, X, Phone, User, Store, Loader2, XCircle, ImageIcon } from 'lucide-react';",
  "import { LayoutDashboard, Users, Scissors, MessageSquare, PlusCircle, Calendar, ArrowRight, ArrowLeft, MoreVertical, Check, X, Phone, User, Store, Loader2, XCircle, ImageIcon, AlertCircle } from 'lucide-react';"
);
fs.writeFileSync('src/screens/Dashboards.tsx', content);
