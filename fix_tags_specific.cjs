const fs = require('fs');

function fix(filePath) {
    let lines = fs.readFileSync(filePath, 'utf8').split('\n');

    // 936
    if (lines[935].trim() === '</div>' && lines[936].includes(')}')) {
        lines[935] = '              </>';
    }

    // 1001
    // 999|                            <div className="text-xs text-stone-500 line-through">{currSymbol} {srv.original_price}</div>
    // 1000|                            <div className="font-bold text-stone-50">{currSymbol} {srv.discount_price}</div>
    // 1001|      </div>
    // 1002|                        ) : (
    if (lines[1000] === '      </div>' && lines[1001].includes(') : (')) {
        lines[1000] = '                        </>';
    }

    // 1427
    // 1425|        </div>
    // 1426|        {overlays}
    // 1427|      </div>
    // 1428|      );
    // 1429|    }
    // Wait, step === 'my-bookings' was a fragment: `return ( <> ...`
    // Let's replace the top of 'my-bookings' to not use <> if it does.
    
    fs.writeFileSync(filePath, lines.join('\n'));
}

fix('src/screens/ClientApp.tsx');
