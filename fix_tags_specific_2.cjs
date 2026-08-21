const fs = require('fs');

function fix(filePath) {
    let lines = fs.readFileSync(filePath, 'utf8').split('\n');

    for (let i = 0; i < lines.length; i++) {
        // Line 1001 issue
        if (lines[i].includes('</div>') && lines[i+1] && lines[i+1].includes(') : (')) {
            if (lines[i-1].includes('discount_price')) {
                lines[i] = '                        </>';
            }
        }
        
        // Line 1427 issue: closing of 'my-bookings'
        // Let's find 'my-bookings' step
        if (lines[i].includes(`if (step === 'my-bookings') {`)) {
            // Find the return statement inside
            for(let j = i; j < i + 20; j++) {
                if (lines[j].includes('return (')) {
                    // Make sure it starts with the correct wrapper
                    if (lines[j+1] && lines[j+1].includes('<>')) {
                        lines[j+1] = '      <div className="min-h-screen bg-stone-950 font-sans selection:bg-amber-500/30 text-stone-200 pb-24">';
                    }
                    break;
                }
            }
        }
    }
    
    // Also, there might still be some </div/> tags matching overlays for 'my-bookings'
    // Let's find the overlays block for my-bookings
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('{overlays}') && lines[i-1].includes('</div>') && lines[i+1] && lines[i+1].includes('</div>')) {
            // Let's check if there's a fragment mismatch. If it opened with div (which we just fixed), then ending with div is correct.
            // But if it originally opened with `<>`, we replaced it with `<div>`. So closing with `</div>` is correct!
        }
    }
    
    fs.writeFileSync(filePath, lines.join('\n'));
}

fix('src/screens/ClientApp.tsx');
