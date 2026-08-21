const fs = require('fs');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix hero section transparent buttons
    content = content.replace(/bg-stone-900\/20 hover:bg-stone-900\/30/g, 'bg-white/10 hover:bg-white/20');
    content = content.replace(/bg-stone-900\/10/g, 'bg-white/10');
    
    // In dark mode, if the app background is stone-950, then we want text to be stone-200 generally.
    content = content.replace(/<div className="min-h-screen bg-stone-900\/40/g, '<div className="min-h-screen bg-stone-950');
    content = content.replace(/<div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">/g, '<div className="min-h-screen bg-stone-950 font-sans selection:bg-amber-500/30 text-stone-200"><div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">');
    
    // Ensure all ClientApp roots have the right background.
    // Replace the main return block:
    const mainReturnStart = `  return (
    <>
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">`;
    const newMainReturnStart = `  return (
    <div className="min-h-screen bg-stone-950 font-sans selection:bg-amber-500/30 text-stone-200 pb-24">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">`;
    
    content = content.replace(mainReturnStart, newMainReturnStart);
    
    // Also the end of ClientApp
    const mainReturnEnd = `    </div>
      {overlays}
    </>`;
    const newMainReturnEnd = `    </div>
      {overlays}
    </div>`;
    content = content.replace(mainReturnEnd, newMainReturnEnd);

    // Update ClientApp step views to have dark root or use the main wrapper if they already do.
    // Wait, step === 'profile' etc. also return fragments.
    const steps = ['confirmed', 'datetime', 'salon-details', 'services', 'profile', 'my-bookings'];
    for(let step of steps) {
      const regex = new RegExp(`if \\(step === '${step}'.*?\\)\\s*\\{\\s*return \\(\\s*<>\\s*<div className="max-w-([a-z0-9]+) mx-auto p-4 md:p-8(.*?)">`, 'g');
      content = content.replace(regex, `if (step === '${step}'$3) {
    return (
      <div className="min-h-screen bg-stone-950 font-sans selection:bg-amber-500/30 text-stone-200 pb-24">
        <div className="max-w-$1 mx-auto p-4 md:p-8$2">`);
    }

    // Fix fragments at the end of steps
    content = content.replace(/<\/div>\s*\{overlays\}\s*<\/>/g, '</div>\n      {overlays}\n    </div>');
    content = content.replace(/<\/div>\s*<\/>/g, '</div>\n    </div>');

    // Make inputs look dark
    content = content.replace(/bg-stone-900 border-stone-800\/50/g, 'bg-stone-900 border-stone-800 text-stone-100');
    content = content.replace(/bg-stone-900 border-stone-800/g, 'bg-stone-900 border-stone-800 text-stone-100');
    
    // Buttons:
    content = content.replace(/bg-amber-500 text-stone-950 hover:bg-amber-400/g, 'bg-amber-500 text-stone-950 font-bold hover:bg-amber-400');
    
    fs.writeFileSync(filePath, content);
}

fix('src/screens/ClientApp.tsx');
console.log('ClientApp fixed');
