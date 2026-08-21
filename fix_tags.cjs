const fs = require('fs');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Restore all top-level step wrappers.
    // We want the steps to return ( <div className="min-h-screen bg-stone-950 font-sans selection:bg-amber-500/30 text-stone-200 pb-24"> ... </div> );
    // So we don't need a <> fragment at all!
    
    // First, let's fix the broken closing fragments. We can do this by regex if we know exactly what is wrong.
    // Instead of regex, let's just restore from a clean state? We don't have git.
    
    // Let's replace the broken closing tags:
    content = content.replace(/<\/div>\n\s*\{overlays\}\n\s*<\/div>/g, '</div>\n      {overlays}\n    </div>'); // Wait, if it was <> ... </>, we need to remove the <> from the start of the returns.
    
    // Let's find all `return (\n      <div className="min-h-screen` which might have a stray `<>` above them.
    content = content.replace(/return \(\s*<>\s*<div className="min-h-screen/g, 'return (\n      <div className="min-h-screen');
    
    // And for the end of those steps:
    // Some were like:
    // </div>
    // {overlays}
    // </div>
    // If we removed `<>`, then `</div>` is the correct closing tag.
    
    // Wait! Let's check if the opening fragment `<>` is there.
    
    fs.writeFileSync(filePath, content);
}

fix('src/screens/ClientApp.tsx');
