const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update useAppContext destruct
content = content.replace(
  /const \{ lang, setLang, isAr, role, setRole, isLoadingAuth \} = useAppContext\(\);/,
  "const { lang, setLang, isAr, role, setRole, isLoadingAuth, headerTitle } = useAppContext();"
);

// Replace SALONERA with headerTitle
content = content.replace(
  /<h1 className=\{`text-2xl font-bold tracking-tight \$\{isAr \? 'font-arabic' : ''\}`\}>\n\s*SALONERA\n\s*<\/h1>/,
  "<h1 className={`text-2xl font-bold tracking-tight ${isAr ? 'font-arabic' : ''}`}>\n          {headerTitle || 'SALONERA'}\n        </h1>"
);

// We should also display the user name next to it? Wait, the user asked to put the salon name and the user's name in the header.
// So let's just make headerTitle a string that can hold both.

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx");
