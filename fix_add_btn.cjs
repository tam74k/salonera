const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const targetAddBtn = `onClick={() => setShowAddService(!showAddService)}`;
const replacementAddBtn = `onClick={() => {
                      if (showAddService) {
                        setShowAddService(false);
                        setEditingServiceId(null);
                        setSrvNameAr(''); setSrvNameEn(''); setSrvPrice(''); setSrvDiscountPrice(''); setSrvDuration('30');
                      } else {
                        setShowAddService(true);
                      }
                    }}`;

content = content.replace(targetAddBtn, replacementAddBtn);
fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log('Fixed add btn');
