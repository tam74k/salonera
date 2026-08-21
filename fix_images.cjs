const fs = require('fs');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace object-cover with object-contain for all salon images in ClientApp
    // Also remove group-hover:scale-105 and group-hover:rotate-1
    content = content.replace(/object-cover group-hover:scale-105 transition-transform duration-500/g, 'object-contain transition-transform duration-500 p-2');
    content = content.replace(/object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-1000 ease-out/g, 'object-contain transition-all duration-1000 ease-out p-4');
    
    // For salon details banner:
    content = content.replace(/className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"/g, 'className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 p-2"');
    content = content.replace(/className="absolute inset-0 w-full h-full object-cover"/g, 'className="absolute inset-0 w-full h-full object-contain p-2"');

    // For dashboard salon images:
    content = content.replace(/w-full h-32 object-cover/g, 'w-full h-32 object-contain p-1 bg-stone-900/50');
    
    fs.writeFileSync(filePath, content);
}

fix('src/screens/ClientApp.tsx');
fix('src/screens/Dashboards.tsx');
console.log('Images fixed');
