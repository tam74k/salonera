const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const targetState = "  const [srvNameAr, setSrvNameAr] = useState('');";
const replacementState = "  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);\n  const [srvNameAr, setSrvNameAr] = useState('');";

content = content.replace(targetState, replacementState);
fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log('Fixed states');
