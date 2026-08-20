const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// 1. Add artistTab state
content = content.replace("const [activeTab, setActiveTab] = useState('dashboard');",
  "const [activeTab, setActiveTab] = useState('dashboard');\n  const [artistTab, setArtistTab] = useState('today');");

// 2. Extract the Edit Booking Modal block
const modalStartRegex = /\{\/\* Edit Booking Modal \*\/\}/;
const modalEndRegex = /<\/AnimatePresence>\n\s*<\/div>\n\s*<h2/;

// Since this is a bit tricky with regex, let's just write a custom script to parse it out
