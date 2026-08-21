const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// 1. Move the Preview Modal and Toast Notification to a variable or inject it into my-bookings
const modalRegex = /\{\/\* Preview Modal \*\/\}(.|\n)*?\{\/\* Global Toast Notification \*\/\}/m;
const match = content.match(modalRegex);
let modalContent = match ? match[0] : '';

const toastRegex = /\{\/\* Global Toast Notification \*\/\}(.|\n)*?<\/AnimatePresence>/m;
const toastMatch = content.match(toastRegex);
let toastContent = toastMatch ? toastMatch[0] : '';

if (!modalContent || !toastContent) {
  console.log("Could not find modal or toast");
}

// Remove from bottom
content = content.replace(modalContent, '');
content = content.replace(toastContent, '');

// We will inject them right before `return` statements so they appear in all steps? 
// No, the easiest way is to wrap all returns inside a helper or just inject them at the bottom of `my-bookings` and the main `return`.
// Let's create a shared const at the top of the render logic:
const sharedOverlays = `
  const overlays = (
    <>
      ` + modalContent.replace(/\$/g, '$$$$') + `
      ` + toastContent.replace(/\$/g, '$$$$') + `
    </>
  );
`;

// Insert `sharedOverlays` after the handlers but before `if (step === 'confirmed')`
const insertPoint = `  if (step === 'confirmed' && bookingConfirmed) {`;
content = content.replace(insertPoint, sharedOverlays + '\n' + insertPoint);

// Now, inject {overlays} into every return!
// 1. confirmed
content = content.replace(`        </motion.div>\n      </div>\n    );`, `        </motion.div>\n      </div>\n      {overlays}\n    </>;`);
content = content.replace(/if \(step === 'confirmed' && bookingConfirmed\) \{\n    return \(\n      <div/g, `if (step === 'confirmed' && bookingConfirmed) {\n    return (\n      <>\n      <div`);

// 2. datetime
content = content.replace(`          </div>\n        </div>\n      </div>\n    );`, `          </div>\n        </div>\n      </div>\n      {overlays}\n    </>;`);
content = content.replace(/if \(step === 'datetime' && selectedSalon\) \{\n    return \(\n      <div/g, `if (step === 'datetime' && selectedSalon) {\n    return (\n      <>\n      <div`);

// 3. services
content = content.replace(`          )}\n        </div>\n      </div>\n    );`, `          )}\n        </div>\n      </div>\n      {overlays}\n    </>;`);
content = content.replace(/if \(step === 'services' && selectedSalon\) \{\n    return \(\n      <div/g, `if (step === 'services' && selectedSalon) {\n    return (\n      <>\n      <div`);

// 4. profile
content = content.replace(`          </div>\n        </div>\n      </div>\n    );`, `          </div>\n        </div>\n      </div>\n      {overlays}\n    </>;`);
content = content.replace(/if \(step === 'profile'\) \{\n    return \(\n      <div/g, `if (step === 'profile') {\n    return (\n      <>\n      <div`);

// 5. my-bookings
content = content.replace(/        <\/div>\n      <\/div>\n    \);\n  \}/g, `        </div>\n      </div>\n      {overlays}\n    </>;\n  }`);
content = content.replace(/if \(step === 'my-bookings'\) \{\n(.*?)return \(\n      <div/gs, `if (step === 'my-bookings') {\n$1return (\n      <>\n      <div`);

// 6. Main return (salons)
content = content.replace(`    </div>\n  );\n}`, `    </div>\n      {overlays}\n    </>\n  );\n}`);
content = content.replace(/  return \(\n    <div/g, `  return (\n    <>\n    <div`);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Success moving overlays");
