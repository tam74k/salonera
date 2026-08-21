const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

content = content.replace(/      \{overlays\}\n    <\/>;/g, "      {overlays}\n    </>\n    );");
content = content.replace(/      \{overlays\}\n    <\/>;\n  \}/g, "      {overlays}\n    </>\n    );\n  }");

fs.writeFileSync('src/screens/ClientApp.tsx', content);
