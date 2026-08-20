const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

if (!content.includes('AnimatePresence')) {
  content = content.replace("import { motion } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");
} else if (!content.match(/import \{[^}]*AnimatePresence[^}]*\} from 'motion\/react'/)) {
  content = content.replace("import { motion } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");
}

fs.writeFileSync('src/screens/Dashboards.tsx', content);
