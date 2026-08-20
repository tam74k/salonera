const fs = require('fs');
let content = fs.readFileSync('src/store.tsx', 'utf8');

// Add to context type
content = content.replace(
  /isLoadingAuth: boolean;\n}/,
  "isLoadingAuth: boolean;\n  headerTitle: string;\n  setHeaderTitle: (title: string) => void;\n}"
);

// Add to provider
content = content.replace(
  /const \[isLoadingAuth, setIsLoadingAuth\] = useState\(true\);/,
  "const [isLoadingAuth, setIsLoadingAuth] = useState(true);\n  const [headerTitle, setHeaderTitle] = useState('');"
);

// Add to provider return
content = content.replace(
  /value=\{\{ lang, setLang, isAr: lang === 'ar', role, setRole, user, session, isLoadingAuth \}\}/,
  "value={{ lang, setLang, isAr: lang === 'ar', role, setRole, user, session, isLoadingAuth, headerTitle, setHeaderTitle }}"
);

fs.writeFileSync('src/store.tsx', content);
console.log("Updated store.tsx");
