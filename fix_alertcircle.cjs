const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

content = content.replace(
  /import \{ CheckCircle2, ImageIcon, Clock, PlusCircle, Settings, Users, Calendar, LayoutDashboard, MessageSquare, Scissors, XCircle, Loader2 \} from 'lucide-react';/,
  "import { CheckCircle2, ImageIcon, Clock, PlusCircle, Settings, Users, Calendar, LayoutDashboard, MessageSquare, Scissors, XCircle, Loader2, AlertCircle } from 'lucide-react';"
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
